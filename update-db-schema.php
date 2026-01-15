<?php

/**
 * Database schema update script
 * Run this once to update existing wp_cabinet_quotes table to allow NULL values
 * 
 * Usage: wp eval-file update-db-schema.php
 * Or access via browser: yoursite.com/wp-content/plugins/cabinets-calculator/update-db-schema.php?update=1
 */

// Load WordPress
require_once('../../../wp-load.php');

// Check for update parameter
if (!isset($_GET['update']) || $_GET['update'] !== '1') {
	die('Add ?update=1 to the URL to run this migration');
}

global $wpdb;
$table_name = $wpdb->prefix . 'cabinet_quotes';

// Check if table exists
$table_exists = $wpdb->get_var("SHOW TABLES LIKE '$table_name'") === $table_name;

if (!$table_exists) {
	die("Table $table_name does not exist. Plugin needs to be activated first.");
}

echo "<h2>Updating $table_name schema...</h2>\n";

// Alter columns to allow NULL
$queries = [
	"ALTER TABLE `$table_name` MODIFY `layout_type` varchar(50) DEFAULT NULL",
	"ALTER TABLE `$table_name` MODIFY `linear_feet` int(11) DEFAULT NULL",
	"ALTER TABLE `$table_name` MODIFY `ceiling_config` varchar(50) DEFAULT NULL",
];

foreach ($queries as $query) {
	echo "<p>Running: <code>$query</code></p>\n";
	$result = $wpdb->query($query);

	if ($result === false) {
		echo "<p style='color: red;'>❌ Error: " . $wpdb->last_error . "</p>\n";
	} else {
		echo "<p style='color: green;'>✅ Success</p>\n";
	}
}

echo "<h3>✅ Migration complete!</h3>\n";
echo "<p>You can now use island-only configurations without errors.</p>\n";
