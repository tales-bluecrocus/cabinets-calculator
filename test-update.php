<?php

/**
 * Test Update Checker
 * Access: yoursite.com/wp-content/plugins/cabinets-calculator/test-update.php
 */

// Load WordPress
require_once('../../../wp-load.php');

if (!is_admin()) {
	die('Must be admin');
}

echo '<h1>Update Checker Test</h1>';

// Check if vendor exists
$vendor_path = __DIR__ . '/vendor/plugin-update-checker/plugin-update-checker.php';
echo '<p>Vendor exists: ' . (file_exists($vendor_path) ? '✅ YES' : '❌ NO') . '</p>';
echo '<p>Vendor path: ' . $vendor_path . '</p>';

// Check current version
echo '<p>Current version: ' . CABINETS_CALC_VERSION . '</p>';

// Check GitHub API
$api_url = 'https://api.github.com/repos/tales-bluecrocus/cabinets-calculator/releases/latest';
$response = wp_remote_get($api_url);

if (is_wp_error($response)) {
	echo '<p>❌ GitHub API Error: ' . $response->get_error_message() . '</p>';
} else {
	$body = json_decode(wp_remote_retrieve_body($response), true);
	echo '<p>Latest release: ' . ($body['tag_name'] ?? 'not found') . '</p>';
	echo '<p>Published at: ' . ($body['published_at'] ?? 'unknown') . '</p>';
	echo '<p>Download URL: ' . ($body['assets'][0]['browser_download_url'] ?? 'none') . '</p>';
}

// Force update check
if (function_exists('delete_site_transient')) {
	delete_site_transient('update_plugins');
	echo '<p>✅ Cleared update transient</p>';
}

echo '<p><a href="/wp-admin/plugins.php">Go to Plugins page</a></p>';
