<?php

/**
 * Customer Quote Confirmation Email Template (Plain Text)
 */

if (!defined('ABSPATH')) {
	exit;
}

$customer = $customerInfo;
?>
YOUR CABINET ESTIMATE
=====================

Hi <?php echo $customer['name']; ?>,

Thank you for requesting a quote from BluePrint Cabinets! We're excited to work with you on your kitchen project.

YOUR ESTIMATED INVESTMENT
-------------------------
<?php if (!empty($estimate['cabinet'])): ?>
	Wall Cabinets (<?php echo $estimate['cabinet']['linearFeet']; ?> linear feet): $<?php echo number_format($estimate['cabinet']['subtotalLow']); ?>

<?php endif; ?>
<?php if (!empty($estimate['island'])): ?>
	Island (<?php echo $estimate['island']['dimensions']; ?>): $<?php echo number_format($estimate['island']['price']); ?>

<?php endif; ?>
TOTAL ESTIMATE: $<?php echo number_format($estimate['total']['low']); ?>
WHAT'S NEXT?
------------
- Our team will review your request within 24 hours
- We'll contact you to discuss your specific needs and preferences
- We'll schedule a consultation to provide a detailed quote

This estimate is based on standard configurations. Your final price may vary based on:
- Cabinet style and finish
- Hardware selection
- Special features or modifications
- Installation requirements

If you have any questions in the meantime, don't hesitate to reach out!

Best regards,
The BluePrint Cabinets Team

---
This is an automated estimate. A member of our team will contact you soon with a personalized quote.
© <?php echo date('Y'); ?> BluePrint Cabinets. All rights reserved.
