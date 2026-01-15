<?php

/**
 * Debug Update Checker
 * Add to wp-config.php: define('WP_DEBUG', true); define('WP_DEBUG_LOG', true);
 */

add_action('init', function () {
	if (!is_admin() || !current_user_can('manage_options')) {
		return;
	}

	if (isset($_GET['puc_debug'])) {
		require_once(WP_PLUGIN_DIR . '/cabinets-calculator/vendor/plugin-update-checker/plugin-update-checker.php');

		echo '<h1>Update Checker Debug</h1>';

		// Test GitHub API
		$api_url = 'https://api.github.com/repos/tales-bluecrocus/cabinets-calculator/releases/latest';
		$response = wp_remote_get($api_url);

		if (!is_wp_error($response)) {
			$release = json_decode(wp_remote_retrieve_body($response), true);
			echo '<h2>GitHub Release Info:</h2>';
			echo '<pre>';
			echo 'Tag: ' . ($release['tag_name'] ?? 'N/A') . "\n";
			echo 'Version: ' . str_replace('v', '', $release['tag_name'] ?? '') . "\n";
			echo 'Asset: ' . ($release['assets'][0]['name'] ?? 'N/A') . "\n";
			echo 'Download: ' . ($release['assets'][0]['browser_download_url'] ?? 'N/A') . "\n";
			echo '</pre>';
		}

		// Current plugin version
		$plugin_file = WP_PLUGIN_DIR . '/cabinets-calculator/cabinets-calculator.php';
		$plugin_data = get_plugin_data($plugin_file);

		echo '<h2>Installed Plugin:</h2>';
		echo '<pre>';
		echo 'Version: ' . $plugin_data['Version'] . "\n";
		echo 'Plugin File: ' . $plugin_file . "\n";
		echo '</pre>';

		// Force check
		delete_site_transient('update_plugins');
		wp_update_plugins();

		$updates = get_site_transient('update_plugins');
		echo '<h2>WordPress Update Transient:</h2>';
		echo '<pre>';
		if (isset($updates->response['cabinets-calculator/cabinets-calculator.php'])) {
			print_r($updates->response['cabinets-calculator/cabinets-calculator.php']);
		} else {
			echo 'No update found for cabinets-calculator';
		}
		echo '</pre>';

		die();
	}
});
