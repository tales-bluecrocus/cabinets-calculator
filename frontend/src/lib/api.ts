import type { QuoteSubmissionRequest, ApiResponse } from "@/types/estimator";

/**
 * Get the API base URL
 */
function getApiUrl(): string {
	// Check for WordPress config
	if (window.cabinetsCalculatorConfig?.restUrl) {
		return window.cabinetsCalculatorConfig.restUrl;
	}
	// Fallback for development
	return "/wp-json/cabinets-calculator/v1/";
}

/**
 * Get request headers including WordPress nonce if available
 */
function getHeaders(): HeadersInit {
	const headers: HeadersInit = {
		"Content-Type": "application/json",
	};

	if (window.cabinetsCalculatorConfig?.nonce) {
		headers["X-WP-Nonce"] = window.cabinetsCalculatorConfig.nonce;
	}

	return headers;
}

/**
 * Submit a quote request to the WordPress backend
 */
export async function submitQuoteRequest(
	data: QuoteSubmissionRequest
): Promise<ApiResponse> {
	const apiUrl = getApiUrl();

	try {
		const response = await fetch(`${apiUrl}submit-quote`, {
			method: "POST",
			headers: getHeaders(),
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				errorData.message || "Failed to submit quote request"
			);
		}

		const result = await response.json();
		return {
			success: true,
			message: result.message || "Quote request submitted successfully!",
			warning: result.warning,
		};
	} catch (error) {
		console.error("Quote submission error:", error);
		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: "An error occurred. Please try again.",
		};
	}
}

/**
 * Get public settings from WordPress
 */
export async function getPublicSettings(): Promise<{
	showroomUrl?: string;
	contactPhone?: string;
	companyName?: string;
}> {
	const apiUrl = getApiUrl();

	try {
		const response = await fetch(`${apiUrl}settings`, {
			method: "GET",
			headers: getHeaders(),
		});

		if (!response.ok) {
			return {};
		}

		return await response.json();
	} catch (error) {
		console.error("Settings fetch error:", error);
		return {};
	}
}
