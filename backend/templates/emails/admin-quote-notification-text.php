<?php

/**
 * Admin Quote Notification Email Template (Plain Text)
 */

if (!defined('ABSPATH')) {
	exit;
}

$customer = $customerInfo;
?>
NEW QUOTE REQUEST
=================

CUSTOMER INFORMATION
Name: <?php echo $customer['name']; ?>

Email: <?php echo $customer['email']; ?>

<?php if (!empty($customer['phone'])): ?>
	Phone: <?php echo $customer['phone']; ?>

<?php endif; ?>
Preferred Contact: <?php echo ucfirst($customer['preferredContact'] ?? 'email'); ?>

<?php if (!empty($layoutType)): ?>

	KITCHEN DETAILS
	Layout: <?php echo $layoutType; ?>

	Linear Feet: <?php echo $linearFeet; ?> ft
	Ceiling Config: <?php echo $ceilingConfig; ?>

<?php endif; ?>
<?php if (!empty($hasIsland) && !empty($islandDimensions)): ?>

	ISLAND DETAILS
	Dimensions: <?php echo $islandDimensions['length']; ?>ft × <?php echo $islandDimensions['width']; ?>ft
	ESTIMATE
	<?php if (!empty($estimate['cabinet'])): ?>
		Cabinets: $<?php echo number_format($estimate['cabinet']['subtotalLow']); ?>

	<?php endif; ?>
	Island: $<?php echo number_format($estimate['island']['price']); ?>

<?php endif; ?>
TOTAL: $<?php echo number_format($estimate['total']['low']); ?>

<?php if (!empty($customer['notes'])): ?>
	NOTES
	<?php echo $customer['notes']; ?>


<?php endif; ?>
Submitted on <?php echo date('F j, Y \a\t g:i a'); ?>
