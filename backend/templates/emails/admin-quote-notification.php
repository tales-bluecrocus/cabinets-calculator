<?php

/**
 * Admin Quote Notification Email Template (HTML)
 *
 * Available variables:
 * - $customerInfo
 * - $layoutType
 * - $linearFeet
 * - $ceilingConfig
 * - $hasIsland
 * - $islandDimensions
 * - $estimate
 */

if (!defined('ABSPATH')) {
	exit;
}

$customer = $customerInfo;

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
	'single-wall' => 'Single Galley',
	'other' => 'Other',
];
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

		.section {
			padding: 20px;
			border-bottom: 1px solid #eee;
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

		.label {
			color: #718096;
			font-size: 14px;
		}

		.value {
			font-weight: bold;
		}

		table {
			width: 100%;
			border-collapse: collapse;
		}

		td {
			padding: 8px 0;
		}
	</style>
</head>

<body>
	<div class="container">
		<div class="header">
			<h1>New Quote Request</h1>
		</div>

		<div class="section">
			<h2>Customer Information</h2>
			<table>
				<tr>
					<td class="label">Name:</td>
					<td class="value"><?php echo esc_html($customer['name']); ?></td>
				</tr>
				<tr>
					<td class="label">Email:</td>
					<td class="value"><a href="mailto:<?php echo esc_attr($customer['email']); ?>"><?php echo esc_html($customer['email']); ?></a></td>
				</tr>
				<?php if (!empty($customer['phone'])): ?>
					<tr>
						<td class="label">Phone:</td>
						<td class="value"><a href="tel:<?php echo esc_attr($customer['phone']); ?>"><?php echo esc_html($customer['phone']); ?></a></td>
					</tr>
				<?php endif; ?>
				<tr>
					<td class="label">Preferred Contact:</td>
					<td class="value"><?php echo esc_html(ucfirst($customer['preferredContact'] ?? 'email')); ?></td>
				</tr>
			</table>
		</div>

		<?php if (!empty($layoutType)): ?>
			<div class="section">
				<h2>Kitchen Details</h2>
				<table>
					<tr>
						<td class="label">Layout Type:</td>
						<td class="value"><?php echo esc_html($layout_labels[$layoutType] ?? $layoutType); ?></td>
					</tr>
					<tr>
						<td class="label">Linear Feet:</td>
						<td class="value"><?php echo esc_html($linearFeet); ?> ft</td>
					</tr>
					<tr>
						<td class="label">Ceiling Configuration:</td>
						<td class="value"><?php echo esc_html($ceiling_labels[$ceilingConfig] ?? $ceilingConfig); ?></td>
					</tr>
				</table>
			</div>
		<?php endif; ?>

		<?php if (!empty($hasIsland) && !empty($islandDimensions)): ?>
			<div class="section">
				<h2>Island Details</h2>
				<table>
					<tr>
						<td class="label">Dimensions:</td>
						<td class="value"><?php echo esc_html($islandDimensions['length'] . 'ft × ' . $islandDimensions['width'] . 'ft'); ?></td>
					</tr>
				</table>
			</div>
		<?php endif; ?>

		<div class="estimate-box">
			<h2>Estimate Summary</h2>
			<table>
				<?php if (!empty($estimate['cabinet'])): ?>
					<tr>
						<td>Wall Cabinets (<?php echo esc_html($estimate['cabinet']['linearFeet']); ?> LF × $<?php echo esc_html($estimate['cabinet']['pricePerFoot']); ?>/ft)</td>
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
					<td class="total">TOTAL ESTIMATE</td>
					<td class="total" style="text-align:right;">$<?php echo number_format($estimate['total']['low']); ?></td>
				</tr>
			</table>
		</div>

		<?php if (!empty($customer['notes'])): ?>
			<div class="section">
				<h2>Additional Notes</h2>
				<p><?php echo nl2br(esc_html($customer['notes'])); ?></p>
			</div>
		<?php endif; ?>

		<div class="section" style="font-size:12px;color:#718096;">
			<p>Submitted on <?php echo date('F j, Y \a\t g:i a'); ?></p>
		</div>
	</div>
</body>

</html>
