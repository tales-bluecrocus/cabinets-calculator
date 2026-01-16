<?php

/**
 * Email Service
 *
 * Handles all email operations using Postmark API
 */

namespace BluePrintCabinets\CabinetsCalculator\Services;

use Postmark\PostmarkClient;
use Exception;

if (!defined('ABSPATH')) {
	exit;
}

class EmailService
{
	private $config;
	private $client;
	private $template_loader;

	public function __construct()
	{
		$this->config = include dirname(__DIR__) . '/config/email-config.php';
		$this->template_loader = new EmailTemplateLoader();

		// Only initialize Postmark client if API key is configured
		if (!empty($this->config['postmark']['api_key'])) {
			$this->client = new PostmarkClient($this->config['postmark']['api_key']);
		}
	}

	/**
	 * Check if email service is properly configured
	 */
	public function is_configured(): bool
	{
		return !empty($this->config['postmark']['api_key']) && $this->client !== null;
	}

	/**
	 * Send admin notification email
	 *
	 * @param array $quote_data Quote request data
	 * @return bool Success status
	 */
	public function send_admin_notification(array $quote_data): bool
	{
		if (!$this->is_configured()) {
			error_log('EmailService: Postmark not configured');
			return false;
		}

		try {
			$customer = $quote_data['customerInfo'];
			$subject = sprintf($this->config['subjects']['quote_admin'], $customer['name']);

			$html_body = $this->template_loader->render('admin-quote-notification', $quote_data);
			$text_body = $this->template_loader->render('admin-quote-notification-text', $quote_data);

			$result = $this->client->sendEmail(
				$this->config['addresses']['from'],
				$this->config['addresses']['admin'],
				$subject,
				$html_body,
				$text_body,
				$this->config['tags']['quote_admin'],
				$this->config['postmark']['track_opens'],
				$customer['email'], // Reply To
				null, // CC
				null, // BCC
				null, // Headers
				null, // Attachments
				$this->config['postmark']['track_links'],
				null, // Metadata
				$this->config['postmark']['message_stream']
			);

			return $result->ErrorCode === 0;
		} catch (Exception $e) {
			error_log('EmailService: Admin notification failed - ' . $e->getMessage());
			return false;
		}
	}

	/**
	 * Send customer confirmation email
	 *
	 * @param array $quote_data Quote request data
	 * @return bool Success status
	 */
	public function send_customer_confirmation(array $quote_data): bool
	{
		if (!$this->is_configured()) {
			error_log('EmailService: Postmark not configured');
			return false;
		}

		try {
			$customer = $quote_data['customerInfo'];
			$subject = $this->config['subjects']['quote_customer'];

			$html_body = $this->template_loader->render('customer-quote-confirmation', $quote_data);
			$text_body = $this->template_loader->render('customer-quote-confirmation-text', $quote_data);

			$result = $this->client->sendEmail(
				$this->config['addresses']['from'],
				$customer['email'],
				$subject,
				$html_body,
				$text_body,
				$this->config['tags']['quote_customer'],
				$this->config['postmark']['track_opens'],
				null, // Reply To
				null, // CC
				null, // BCC
				null, // Headers
				null, // Attachments
				$this->config['postmark']['track_links'],
				null, // Metadata
				$this->config['postmark']['message_stream']
			);

			return $result->ErrorCode === 0;
		} catch (Exception $e) {
			error_log('EmailService: Customer confirmation failed - ' . $e->getMessage());
			return false;
		}
	}

	/**
	 * Get configuration value
	 *
	 * @param string $key Dot notation key (e.g., 'postmark.api_key')
	 * @return mixed
	 */
	public function get_config(string $key)
	{
		$keys = explode('.', $key);
		$value = $this->config;

		foreach ($keys as $k) {
			if (!isset($value[$k])) {
				return null;
			}
			$value = $value[$k];
		}

		return $value;
	}
}

/**
 * Email Template Loader
 *
 * Loads and renders email templates
 */
class EmailTemplateLoader
{
	private $template_dir;

	public function __construct()
	{
		$this->template_dir = dirname(__DIR__) . '/templates/emails/';
	}

	/**
	 * Render an email template
	 *
	 * @param string $template Template name (without .php extension)
	 * @param array $data Data to pass to template
	 * @return string Rendered template
	 */
	public function render(string $template, array $data): string
	{
		$template_file = $this->template_dir . $template . '.php';

		if (!file_exists($template_file)) {
			error_log("EmailTemplateLoader: Template not found: {$template_file}");
			return '';
		}

		// Extract data to make variables available in template
		extract($data);

		// Start output buffering
		ob_start();
		include $template_file;
		return ob_get_clean();
	}

	/**
	 * Check if template exists
	 *
	 * @param string $template Template name
	 * @return bool
	 */
	public function template_exists(string $template): bool
	{
		return file_exists($this->template_dir . $template . '.php');
	}
}
