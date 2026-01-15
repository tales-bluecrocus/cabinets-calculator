<?php
/**
 * Plugin Name: BluePrint Cabinets Calculator
 * Plugin URI: https://blueprintcabinets.com
 * Description: Kitchen Cabinet Pricing Estimator with React frontend and Postmark email integration
 * Version: 0.0.9
 * Author: BluePrint Cabinets
 * License: GPL v2 or later
 * Text Domain: cabinets-calculator
 */

if (!defined('ABSPATH')) {
	exit;
}

// Core constants
define('CABINETS_CALC_VERSION', '0.0.9');
define('CABINETS_CALC_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('CABINETS_CALC_PLUGIN_URL', plugin_dir_url(__FILE__));

// Update checker (Composer-installed)
$update_checker_path = CABINETS_CALC_PLUGIN_DIR . 'vendor/yahnis-elsts/plugin-update-checker/load-v5p6.php';
if (file_exists($update_checker_path)) {
	require_once $update_checker_path;
	require_once CABINETS_CALC_PLUGIN_DIR . 'backend/update-checker.php';
} else {
	add_action('admin_notices', function () {
		echo '<div class="notice notice-error"><p><strong>Cabinets Calculator:</strong> Update checker library not found. Plugin updates will not work.</p></div>';
	});
}

class CabinetsCalculator
{
	private static $instance = null;

	public static function get_instance()
	{
		if (self::$instance === null) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	private function __construct()
	{
		add_action('admin_menu', [$this, 'add_admin_menu']);
		add_action('admin_init', [$this, 'register_settings']);
		add_action('wp_enqueue_scripts', [$this, 'enqueue_frontend_assets']);
		add_action('rest_api_init', [$this, 'register_rest_routes']);
		add_shortcode('cabinet_calculator', [$this, 'render_calculator_shortcode']);
	}

	public function register_rest_routes()
	{
		register_rest_route('cabinets-calculator/v1', '/submit-quote', [
'methods' => 'POST',
			'callback' => [$this, 'handle_quote_submission'],
			'permission_callback' => '__return_true',
			'args' => [
				'layoutType' => [
					'required' => true,
					'type' => 'string',
					'sanitize_callback' => 'sanitize_text_field',
				],
				'linearFeet' => [
					'required' => true,
					'type' => 'number',
					'sanitize_callback' => 'absint',
				],
				'ceilingConfig' => [
					'required' => true,
					'type' => 'string',
					'sanitize_callback' => 'sanitize_text_field',
				],
				'hasIsland' => [
					'required' => true,
					'type' => 'boolean',
				],
				'islandDimensions' => [
					'required' => false,
					'type' => 'object',
				],
				'estimate' => [
					'required' => true,
					'type' => 'object',
				],
				'customerInfo' => [
					'required' => true,
					'type' => 'object',
				],
			],
		]);

		register_rest_route('cabinets-calculator/v1', '/settings', [
'methods' => 'GET',
			'callback' => [$this, 'get_public_settings'],
			'permission_callback' => '__return_true',
		]);
	}

	public function handle_quote_submission($request)
	{
		$data = $request->get_params();

		if (empty($data['customerInfo']['name']) || empty($data['customerInfo']['email'])) {
			return new WP_Error('missing_info', 'Name and email are required', ['status' => 400]);
		}

		if (!is_email($data['customerInfo']['email'])) {
			return new WP_Error('invalid_email', 'Please provide a valid email address', ['status' => 400]);
		}

		$postmark_api_key = get_option('cabinets_calc_postmark_api_key');
		$admin_email = get_option('cabinets_calc_admin_email', get_option('admin_email'));
		$from_email = get_option('cabinets_calc_from_email', 'noreply@blueprintcabinets.com');

		if (empty($postmark_api_key)) {
			$this->log_submission($data);
			return new WP_REST_Response([
'success' => true,
				'message' => 'Quote request received. We will contact you soon!',
			], 200);
		}

		$this->log_submission($data);
		$email_sent = $this->send_postmark_email($data, $postmark_api_key, $admin_email, $from_email);

		if ($email_sent) {
			return new WP_REST_Response([
'success' => true,
				'message' => 'Quote request submitted successfully! We will contact you within 24 hours.',
			], 200);
		}

		return new WP_REST_Response([
'success' => true,
			'message' => 'Quote request received. We will contact you soon!',
			'warning' => 'Email notification may be delayed.',
		], 200);
	}

	private function send_postmark_email($data, $api_key, $admin_email, $from_email)
	{
		$customer = $data['customerInfo'];
		$subject = sprintf('New Cabinet Quote Request from %s', $customer['name']);

		$response = wp_remote_post('https://api.postmarkapp.com/email', [
'headers' => [
				'Accept' => 'application/json',
				'Content-Type' => 'application/json',
				'X-Postmark-Server-Token' => $api_key,
			],
			'body' => wp_json_encode([
'From' => $from_email,
				'To' => $admin_email,
				'ReplyTo' => $customer['email'],
				'Subject' => $subject,
				'HtmlBody' => $this->build_email_html($data),
				'TextBody' => $this->build_email_text($data),
				'Tag' => 'cabinet-quote',
				'TrackOpens' => true,
			]),
			'timeout' => 30,
		]);

		if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
			error_log('Postmark API Error: ' . (is_wp_error($response) ? $response->get_error_message() : wp_remote_retrieve_body($response)));
			return false;
		}

		$this->send_customer_confirmation($data, $api_key, $from_email);
		return true;
	}

	private function send_customer_confirmation($data, $api_key, $from_email)
	{
		$customer = $data['customerInfo'];

		wp_remote_post('https://api.postmarkapp.com/email', [
'headers' => [
				'Accept' => 'application/json',
				'Content-Type' => 'application/json',
				'X-Postmark-Server-Token' => $api_key,
			],
			'body' => wp_json_encode([
'From' => $from_email,
				'To' => $customer['email'],
				'Subject' => 'Your BluePrint Cabinets Estimate',
				'HtmlBody' => $this->build_customer_email_html($data),
				'TextBody' => $this->build_customer_email_text($data),
				'Tag' => 'cabinet-quote-confirmation',
				'TrackOpens' => true,
			]),
			'timeout' => 30,
		]);
	}

	private function build_email_html($data)
	{
		$customer = $data['customerInfo'];
		$estimate = $data['estimate'];
		$ceiling_labels = [
			'8ft-open' => '8ft Ceiling - Open Top ($350/LF)',
			'8ft-crown' => '8ft Ceiling - Crown Molding ($401/LF)',
			'8ft-ceiling' => '8ft Ceiling - To Ceiling ($435/LF)',
			'9ft-ceiling' => '9ft Ceiling - To Ceiling ($480/LF)',
			'10ft-ceiling' => '10ft Ceiling - Stacked ($571/LF)',
		];
		$layout_labels = [
			'l-shape' => 'L-Shaped',
			'u-shape' => 'U-Shaped',
			'galley' => 'Galley',
			'single-wall' => 'Single Wall',
			'other' => 'Other',
		];

		ob_start();
		?>
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; }
				.header { background: #1a365d; color: white; padding: 20px; text-align: center; }
				.section { padding: 20px; border-bottom: 1px solid #eee; }
				.estimate-box { background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
				.total { font-size: 24px; font-weight: bold; color: #1a365d; }
				.label { color: #718096; font-size: 14px; }
				.value { font-weight: bold; }
				table { width: 100%; border-collapse: collapse; }
				td { padding: 8px 0; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header"><h1>New Quote Request</h1></div>
				<div class="section">
					<h2>Customer Information</h2>
					<table>
						<tr><td class="label">Name:</td><td class="value"><?php echo esc_html($customer['name']); ?></td></tr>
						<tr><td class="label">Email:</td><td class="value"><a href="mailto:<?php echo esc_attr($customer['email']); ?>"><?php echo esc_html($customer['email']); ?></a></td></tr>
						<?php if (!empty($customer['phone'])): ?>
						<tr><td class="label">Phone:</td><td class="value"><a href="tel:<?php echo esc_attr($customer['phone']); ?>"><?php echo esc_html($customer['phone']); ?></a></td></tr>
						<?php endif; ?>
						<tr><td class="label">Preferred Contact:</td><td class="value"><?php echo esc_html(ucfirst($customer['preferredContact'] ?? 'email')); ?></td></tr>
					</table>
				</div>
				<div class="section">
					<h2>Kitchen Details</h2>
					<table>
						<tr><td class="label">Layout Type:</td><td class="value"><?php echo esc_html($layout_labels[$data['layoutType']] ?? $data['layoutType']); ?></td></tr>
						<tr><td class="label">Linear Feet:</td><td class="value"><?php echo esc_html($data['linearFeet']); ?> ft</td></tr>
						<tr><td class="label">Ceiling Configuration:</td><td class="value"><?php echo esc_html($ceiling_labels[$data['ceilingConfig']] ?? $data['ceilingConfig']); ?></td></tr>
						<?php if (!empty($data['hasIsland']) && !empty($data['islandDimensions'])): ?>
						<tr><td class="label">Island:</td><td class="value"><?php echo esc_html($data['islandDimensions']['length'] . 'ft × ' . $data['islandDimensions']['width'] . 'ft'); ?></td></tr>
						<?php endif; ?>
					</table>
				</div>
				<div class="estimate-box">
					<h2>Estimate Summary</h2>
					<table>
						<tr><td>Wall Cabinets (<?php echo esc_html($estimate['cabinet']['linearFeet']); ?> LF × $<?php echo esc_html($estimate['cabinet']['pricePerFoot']); ?>/ft)</td><td style="text-align:right;">$<?php echo number_format($estimate['cabinet']['subtotalLow']); ?> - $<?php echo number_format($estimate['cabinet']['subtotalHigh']); ?></td></tr>
						<?php if (!empty($estimate['island'])): ?>
						<tr><td>Island (<?php echo esc_html($estimate['island']['dimensions']); ?>)</td><td style="text-align:right;">$<?php echo number_format($estimate['island']['price']); ?></td></tr>
						<?php endif; ?>
						<tr style="border-top:2px solid #1a365d;"><td class="total">TOTAL ESTIMATE</td><td class="total" style="text-align:right;">$<?php echo number_format($estimate['total']['low']); ?> - $<?php echo number_format($estimate['total']['high']); ?></td></tr>
					</table>
				</div>
				<?php if (!empty($customer['notes'])): ?>
				<div class="section"><h2>Additional Notes</h2><p><?php echo nl2br(esc_html($customer['notes'])); ?></p></div>
				<?php endif; ?>
				<div class="section" style="font-size:12px;color:#718096;"><p>Submitted on <?php echo date('F j, Y \a\t g:i a'); ?></p></div>
			</div>
		</body>
		</html>
		<?php
		return ob_get_clean();
	}

	private function build_email_text($data)
	{
		$customer = $data['customerInfo'];
		$estimate = $data['estimate'];

		$text = "NEW QUOTE REQUEST\n";
		$text .= "=================\n\n";
		$text .= "CUSTOMER INFORMATION\n";
		$text .= "Name: {$customer['name']}\n";
		$text .= "Email: {$customer['email']}\n";
		if (!empty($customer['phone'])) {
			$text .= "Phone: {$customer['phone']}\n";
		}
		$text .= "Preferred Contact: " . ucfirst($customer['preferredContact'] ?? 'email') . "\n\n";
		$text .= "KITCHEN DETAILS\n";
		$text .= "Layout: {$data['layoutType']}\n";
		$text .= "Linear Feet: {$data['linearFeet']} ft\n";
		$text .= "Ceiling Config: {$data['ceilingConfig']}\n";
		if (!empty($data['hasIsland']) && !empty($data['islandDimensions'])) {
			$text .= "Island: {$data['islandDimensions']['length']}ft × {$data['islandDimensions']['width']}ft\n";
		}
		$text .= "\nESTIMATE\n";
		$text .= "Cabinets: $" . number_format($estimate['cabinet']['subtotalLow']) . " - $" . number_format($estimate['cabinet']['subtotalHigh']) . "\n";
		if (!empty($estimate['island'])) {
			$text .= "Island: $" . number_format($estimate['island']['price']) . "\n";
		}
		$text .= "TOTAL: $" . number_format($estimate['total']['low']) . " - $" . number_format($estimate['total']['high']) . "\n\n";
		if (!empty($customer['notes'])) {
			$text .= "NOTES\n{$customer['notes']}\n\n";
		}
		$text .= "Submitted on " . date('F j, Y \a\t g:i a');
		return $text;
	}

	private function build_customer_email_html($data)
	{
		$customer = $data['customerInfo'];
		$estimate = $data['estimate'];

		ob_start();
		?>
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; }
				.header { background: #1a365d; color: white; padding: 20px; text-align: center; }
				.content { padding: 20px; }
				.estimate-box { background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
				.total { font-size: 24px; font-weight: bold; color: #1a365d; }
				.cta { background: #2b6cb0; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
				.disclaimer { font-size: 12px; color: #718096; padding: 20px; background: #f7fafc; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header"><h1>BluePrint Cabinets</h1><p>Your Kitchen Estimate</p></div>
				<div class="content">
					<p>Dear <?php echo esc_html($customer['name']); ?>,</p>
					<p>Thank you for using our Kitchen Cabinet Pricing Estimator! Based on the information you provided, here's your estimate:</p>
<div class="estimate-box">
<h2>Your Estimate Summary</h2>
<p><strong>Kitchen Size:</strong> <?php echo esc_html($data['linearFeet']); ?> linear feet</p>
<table style="width:100%; margin:20px 0;">
<tr><td>Wall Cabinets</td><td style="text-align:right;">$<?php echo number_format($estimate['cabinet']['subtotalLow']); ?> - $<?php echo number_format($estimate['cabinet']['subtotalHigh']); ?></td></tr>
<?php if (!empty($estimate['island'])): ?>
<tr><td>Island (<?php echo esc_html($estimate['island']['dimensions']); ?>)</td><td style="text-align:right;">$<?php echo number_format($estimate['island']['price']); ?></td></tr>
<?php endif; ?>
<tr style="border-top:2px solid #1a365d; font-size:20px;"><td><strong>TOTAL ESTIMATE</strong></td><td style="text-align:right;"><strong>$<?php echo number_format($estimate['total']['low']); ?> - $<?php echo number_format($estimate['total']['high']); ?></strong></td></tr>
</table>
</div>
<h3>What's Next?</h3>
					<p>Our design team has received your request and will reach out within 24 hours to discuss your project in detail.</p>
					<p style="text-align:center;"><a href="https://blueprintcabinets.com/showroom" class="cta">Visit Our Showroom</a></p>
				</div>
				<div class="disclaimer">
					<p><strong>Important Notes:</strong></p>
					<ul>
						<li>This is a ballpark estimate, not a final quote</li>
						<li>Final pricing depends on specific layout and cabinet selections</li>
						<li>Estimate does not include delivery, installation, countertops, or hardware</li>
						<li>Free design consultation is included with every project</li>
					</ul>
				</div>
				<div style="text-align:center; padding:20px; font-size:12px; color:#718096;">
					<p>BluePrint Cabinets | Premium Kitchen Cabinetry</p>
				</div>
			</div>
		</body>
		</html>
		<?php
		return ob_get_clean();
	}

	private function build_customer_email_text($data)
	{
		$customer = $data['customerInfo'];
		$estimate = $data['estimate'];

		$text = "BLUEPRINT CABINETS - YOUR KITCHEN ESTIMATE\n";
		$text .= "==========================================\n\n";
		$text .= "Dear {$customer['name']},\n\n";
		$text .= "Thank you for using our Kitchen Cabinet Pricing Estimator!\n\n";
		$text .= "YOUR ESTIMATE SUMMARY\n";
		$text .= "Kitchen Size: {$data['linearFeet']} linear feet\n\n";
		$text .= "Cabinets: $" . number_format($estimate['cabinet']['subtotalLow']) . " - $" . number_format($estimate['cabinet']['subtotalHigh']) . "\n";
		if (!empty($estimate['island'])) {
			$text .= "Island ({$estimate['island']['dimensions']}): $" . number_format($estimate['island']['price']) . "\n";
		}
		$text .= "\nTOTAL ESTIMATE: $" . number_format($estimate['total']['low']) . " - $" . number_format($estimate['total']['high']) . "\n\n";
		$text .= "WHAT'S NEXT?\nOur design team will reach out within 24 hours.\n\n";
		$text .= "IMPORTANT NOTES:\n";
		$text .= "- This is a ballpark estimate, not a final quote\n";
		$text .= "- Final pricing depends on specific layout and selections\n";
		$text .= "- Does not include: delivery, installation, countertops, hardware\n";
		$text .= "- Free design consultation included\n\n";
		$text .= "BluePrint Cabinets | Premium Kitchen Cabinetry\n";
		return $text;
	}

	private function log_submission($data)
	{
		global $wpdb;
		$table_name = $wpdb->prefix . 'cabinet_quotes';

		$wpdb->insert(
$table_name,
[
'customer_name' => $data['customerInfo']['name'],
				'customer_email' => $data['customerInfo']['email'],
				'customer_phone' => $data['customerInfo']['phone'] ?? '',
				'layout_type' => $data['layoutType'],
				'linear_feet' => $data['linearFeet'],
				'ceiling_config' => $data['ceilingConfig'],
				'has_island' => !empty($data['hasIsland']) ? 1 : 0,
				'island_dimensions' => !empty($data['hasIsland']) && !empty($data['islandDimensions']) ? wp_json_encode($data['islandDimensions']) : null,
				'estimate_low' => $data['estimate']['total']['low'],
				'estimate_high' => $data['estimate']['total']['high'],
				'notes' => $data['customerInfo']['notes'] ?? '',
				'submitted_at' => current_time('mysql'),
			],
			['%s', '%s', '%s', '%s', '%d', '%s', '%d', '%s', '%d', '%d', '%s', '%s']
		);
	}

	public function get_public_settings()
	{
		return new WP_REST_Response([
'showroomUrl' => get_option('cabinets_calc_showroom_url', 'https://blueprintcabinets.com/showroom'),
			'contactPhone' => get_option('cabinets_calc_contact_phone', ''),
			'companyName' => get_option('cabinets_calc_company_name', 'BluePrint Cabinets'),
		], 200);
	}

	public function add_admin_menu()
	{
		add_menu_page(
'Cabinet Calculator',
'Cabinet Calculator',
'manage_options',
'cabinets-calculator',
[$this, 'render_admin_page'],
'dashicons-calculator',
30
);

		add_submenu_page(
'cabinets-calculator',
'Settings',
'Settings',
'manage_options',
'cabinets-calculator-settings',
[$this, 'render_settings_page']
);

		add_submenu_page(
'cabinets-calculator',
'Quote Submissions',
'Quote Submissions',
'manage_options',
'cabinets-calculator-quotes',
[$this, 'render_quotes_page']
);
	}

	public function register_settings()
	{
		register_setting('cabinets_calc_settings', 'cabinets_calc_postmark_api_key');
		register_setting('cabinets_calc_settings', 'cabinets_calc_admin_email');
		register_setting('cabinets_calc_settings', 'cabinets_calc_from_email');
		register_setting('cabinets_calc_settings', 'cabinets_calc_showroom_url');
		register_setting('cabinets_calc_settings', 'cabinets_calc_contact_phone');
		register_setting('cabinets_calc_settings', 'cabinets_calc_company_name');
	}

	public function render_admin_page()
	{
		?>
		<div class="wrap">
			<h1>Cabinet Calculator Dashboard</h1>
			<div class="card">
				<h2>Shortcode</h2>
				<p>Use this shortcode to display the calculator on any page:</p>
				<code>[cabinet_calculator]</code>
			</div>
			<div class="card" style="margin-top: 20px;">
				<h2>Quick Stats</h2>
				<?php
				global $wpdb;
				$table_name = $wpdb->prefix . 'cabinet_quotes';
				$total_quotes = $wpdb->get_var("SELECT COUNT(*) FROM $table_name");
				$today_quotes = $wpdb->get_var($wpdb->prepare(
"SELECT COUNT(*) FROM $table_name WHERE DATE(submitted_at) = %s",
date('Y-m-d')
));
				?>
				<p><strong>Total Quotes:</strong> <?php echo intval($total_quotes); ?></p>
				<p><strong>Today's Quotes:</strong> <?php echo intval($today_quotes); ?></p>
</div>
</div>
<?php
}

public function render_settings_page()
{
?>
<div class="wrap">
<h1>Cabinet Calculator Settings</h1>
<form method="post" action="options.php">
<?php settings_fields('cabinets_calc_settings'); ?>
<table class="form-table" role="presentation">
<tr>
<th scope="row"><label for="cabinets_calc_postmark_api_key">Postmark API Key</label></th>
<td>
<input type="password" name="cabinets_calc_postmark_api_key" id="cabinets_calc_postmark_api_key" value="<?php echo esc_attr(get_option('cabinets_calc_postmark_api_key')); ?>" class="regular-text" />
<p class="description">Your Postmark Server API Token</p>
</td>
</tr>
<tr>
<th scope="row"><label for="cabinets_calc_admin_email">Admin Email</label></th>
<td>
<input type="email" name="cabinets_calc_admin_email" id="cabinets_calc_admin_email" value="<?php echo esc_attr(get_option('cabinets_calc_admin_email', get_option('admin_email'))); ?>" class="regular-text" />
<p class="description">Email address to receive quote notifications</p>
</td>
</tr>
<tr>
<th scope="row"><label for="cabinets_calc_from_email">From Email</label></th>
<td>
<input type="email" name="cabinets_calc_from_email" id="cabinets_calc_from_email" value="<?php echo esc_attr(get_option('cabinets_calc_from_email')); ?>" class="regular-text" />
<p class="description">Sender email address (must be verified in Postmark)</p>
</td>
</tr>
<tr>
<th scope="row"><label for="cabinets_calc_showroom_url">Showroom URL</label></th>
<td>
<input type="url" name="cabinets_calc_showroom_url" id="cabinets_calc_showroom_url" value="<?php echo esc_attr(get_option('cabinets_calc_showroom_url', 'https://blueprintcabinets.com/showroom')); ?>" class="regular-text" />
</td>
</tr>
<tr>
<th scope="row"><label for="cabinets_calc_contact_phone">Contact Phone</label></th>
<td>
<input type="text" name="cabinets_calc_contact_phone" id="cabinets_calc_contact_phone" value="<?php echo esc_attr(get_option('cabinets_calc_contact_phone')); ?>" class="regular-text" />
</td>
</tr>
<tr>
<th scope="row"><label for="cabinets_calc_company_name">Company Name</label></th>
<td>
<input type="text" name="cabinets_calc_company_name" id="cabinets_calc_company_name" value="<?php echo esc_attr(get_option('cabinets_calc_company_name', 'BluePrint Cabinets')); ?>" class="regular-text" />
</td>
</tr>
</table>
<?php submit_button(); ?>
</form>
</div>
<?php
}

public function render_quotes_page()
{
global $wpdb;
$table_name = $wpdb->prefix . 'cabinet_quotes';
$quotes = $wpdb->get_results("SELECT * FROM $table_name ORDER BY submitted_at DESC LIMIT 100");
?>
<div class="wrap">
<h1>Quote Submissions</h1>
<table class="wp-list-table widefat fixed striped">
<thead>
<tr>
<th>Date</th>
<th>Name</th>
<th>Email</th>
<th>Phone</th>
<th>Layout</th>
<th>Linear Ft</th>
<th>Ceiling</th>
<th>Island</th>
<th>Estimate</th>
</tr>
</thead>
<tbody>
<?php if (empty($quotes)): ?>
<tr><td colspan="9">No quotes submitted yet.</td></tr>
<?php else: ?>
<?php foreach ($quotes as $quote): ?>
<tr>
<td><?php echo esc_html(date('M j, Y g:i a', strtotime($quote->submitted_at))); ?></td>
<td><?php echo esc_html($quote->customer_name); ?></td>
<td><a href="mailto:<?php echo esc_attr($quote->customer_email); ?>"><?php echo esc_html($quote->customer_email); ?></a></td>
<td><?php echo esc_html($quote->customer_phone); ?></td>
<td><?php echo esc_html($quote->layout_type); ?></td>
<td><?php echo esc_html($quote->linear_feet); ?> ft</td>
<td><?php echo esc_html($quote->ceiling_config); ?></td>
<td><?php echo $quote->has_island ? esc_html($quote->island_dimensions) : '-'; ?></td>
<td>$<?php echo number_format($quote->estimate_low); ?> - $<?php echo number_format($quote->estimate_high); ?></td>
</tr>
<?php endforeach; ?>
<?php endif; ?>
</tbody>
</table>
</div>
<?php
}

public function enqueue_frontend_assets()
{
// Only load assets when shortcode is present to avoid front-end bloat
if (!$this->should_load_calculator()) {
return;
}

$asset_file = CABINETS_CALC_PLUGIN_DIR . 'frontend/dist/assets/index.js';
$asset_css = CABINETS_CALC_PLUGIN_DIR . 'frontend/dist/assets/index.css';

if (file_exists($asset_file)) {
wp_enqueue_script(
'cabinets-calculator',
CABINETS_CALC_PLUGIN_URL . 'frontend/dist/assets/index.js',
[],
CABINETS_CALC_VERSION,
true
);

wp_localize_script('cabinets-calculator', 'cabinetsCalculatorConfig', [
'restUrl' => rest_url('cabinets-calculator/v1/'),
'nonce' => wp_create_nonce('wp_rest'),
]);
}

if (file_exists($asset_css)) {
wp_enqueue_style(
'cabinets-calculator',
CABINETS_CALC_PLUGIN_URL . 'frontend/dist/assets/index.css',
[],
CABINETS_CALC_VERSION
);
}
}

private function should_load_calculator()
{
global $post;

if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'cabinet_calculator')) {
return true;
}

return false;
}

public function render_calculator_shortcode($atts)
{
$atts = shortcode_atts([
'class' => '',
], $atts);

$class = !empty($atts['class']) ? ' ' . esc_attr($atts['class']) : '';

return '<div id="cabinet-calculator-root" class="cabinet-calculator-container' . $class . '"></div>';
}
}

function cabinets_calculator_init()
{
CabinetsCalculator::get_instance();
}
add_action('plugins_loaded', 'cabinets_calculator_init');

register_activation_hook(__FILE__, function () {
global $wpdb;
$table_name = $wpdb->prefix . 'cabinet_quotes';
$charset_collate = $wpdb->get_charset_collate();

$sql = "CREATE TABLE $table_name (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        customer_name varchar(255) NOT NULL,
        customer_email varchar(255) NOT NULL,
        customer_phone varchar(50) DEFAULT '',
        layout_type varchar(50) NOT NULL,
        linear_feet int(11) NOT NULL,
        ceiling_config varchar(50) NOT NULL,
        has_island tinyint(1) DEFAULT 0,
        island_dimensions text DEFAULT NULL,
        estimate_low int(11) NOT NULL,
        estimate_high int(11) NOT NULL,
        notes text DEFAULT '',
        submitted_at datetime NOT NULL,
        PRIMARY KEY (id),
        KEY customer_email (customer_email),
        KEY submitted_at (submitted_at)
    ) $charset_collate;";

require_once ABSPATH . 'wp-admin/includes/upgrade.php';
dbDelta($sql);
});

register_deactivation_hook(__FILE__, function () {
// No cleanup needed currently
});
