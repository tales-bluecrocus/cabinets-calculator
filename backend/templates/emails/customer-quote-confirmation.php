<?php

/**
 * Customer Quote Confirmation Email Template (HTML)
 */

if (!defined('ABSPATH')) {
	exit;
}

$customer = $customerInfo;
?>
<!DOCTYPE html>
<html>

<head>
	<meta charset="utf-8">
	<style>
		body {
			font-family: Arial, sans-serif;
			line-height: 1.6;
			color: #333;
		}

		.container {
			max-width: 600px;
			margin: 0 auto;
			padding: 20px;
		}

		.header {
			background: #1a365d;
			color: white;
			padding: 20px;
			text-align: center;
		}

		.content {
			padding: 20px;
		}

		.estimate-box {
			background: #f7fafc;
			padding: 20px;
			border-radius: 8px;
			margin: 20px 0;
		}

		.total {
			font-size: 24px;
			font-weight: bold;
			color: #1a365d;
		}

		.footer {
			text-align: center;
			padding: 20px;
			color: #718096;
			font-size: 12px;
		}

		table {
			width: 100%;
		}

		td {
			padding: 8px 0;
		}
	</style>
</head>

<body>
	<div class="container">
		<div class="header">
			<h1>Your Cabinet Estimate</h1>
		</div>

		<div class="content">
			<p>Hi <?php echo esc_html($customer['name']); ?>,</p>

			<p>Thank you for requesting a quote from BluePrint Cabinets! We're excited to work with you on your kitchen project.</p>

			<div class="estimate-box">
				<h2>Your Estimated Investment</h2>
				<table>
					<?php if (!empty($estimate['cabinet'])): ?>
						<tr>
							<td>Wall Cabinets (<?php echo esc_html($estimate['cabinet']['linearFeet']); ?> linear feet)</td>
							<td style="text-align:right;">$<?php echo number_format($estimate['cabinet']['subtotalLow']); ?></td>
						</tr>
					<?php endif; ?>
					<?php if (!empty($estimate['island'])): ?>
						<tr>
							<td>Island (<?php echo esc_html($estimate['island']['dimensions']); ?>)</td>
							<td style="text-align:right;">$<?php echo number_format($estimate['island']['price']); ?></td>
						</tr>
					<?php endif; ?>
					<tr style="border-top:2px solid #1a365d;">
						<td class="total">Total Estimate</td>
						<td class="total" style="text-align:right;">$<?php echo number_format($estimate['total']['low']); ?></td>
					</tr>
				</table>
			</div>

			<p><strong>What's Next?</strong></p>
			<ul>
				<li>Our team will review your request within 24 hours</li>
				<li>We'll contact you to discuss your specific needs and preferences</li>
				<li>We'll schedule a consultation to provide a detailed quote</li>
			</ul>

			<p>This estimate is based on standard configurations. Your final price may vary based on:</p>
			<ul>
				<li>Cabinet style and finish</li>
				<li>Hardware selection</li>
				<li>Special features or modifications</li>
				<li>Installation requirements</li>
			</ul>

			<p>If you have any questions in the meantime, don't hesitate to reach out!</p>

			<p>Best regards,<br>
				<strong>The BluePrint Cabinets Team</strong>
			</p>
		</div>

		<div class="footer">
			<p>This is an automated estimate. A member of our team will contact you soon with a personalized quote.</p>
			<p>&copy; <?php echo date('Y'); ?> BluePrint Cabinets. All rights reserved.</p>
		</div>
	</div>
</body>

</html>
