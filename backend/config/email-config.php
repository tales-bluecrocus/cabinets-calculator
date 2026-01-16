<?php

/**
 * Email Configuration
 *
 * Centralized configuration for email settings
 */

if (!defined('ABSPATH')) {
	exit;
}

return [
	// Postmark Settings
	'postmark' => [
		'api_key' => get_option('cabinets_calc_postmark_api_key', ''),
		'message_stream' => 'outbound',
		'track_opens' => true,
		'track_links' => 'None',
	],

	// Email Addresses
	'addresses' => [
		'from' => get_option('cabinets_calc_from_email', 'noreply@blueprintcabinets.com'),
		'admin' => get_option('cabinets_calc_admin_email', get_option('admin_email')),
		'reply_to' => null, // Will be set dynamically based on customer email
	],

	// Email Tags (for Postmark analytics)
	'tags' => [
		'quote_admin' => 'cabinet-quote-admin',
		'quote_customer' => 'cabinet-quote-customer',
	],

	// Email Subjects
	'subjects' => [
		'quote_admin' => 'New Cabinet Quote Request from %s',
		'quote_customer' => 'Your BluePrint Cabinets Estimate',
	],

	// Timeout for API calls (seconds)
	'timeout' => 30,
];
