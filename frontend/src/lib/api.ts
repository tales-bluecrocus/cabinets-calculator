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
		// Transform configurationType to hasIsland for backend compatibility
		const backendData = {
			...data,
			hasIsland:
				data.configurationType === "island" ||
				data.configurationType === "both",
		};

		console.log("Submitting quote request:", backendData);

		const response = await fetch(`${apiUrl}submit-quote`, {
			method: "POST",
			headers: getHeaders(),
			body: JSON.stringify(backendData),
		});

		console.log("Response status:", response.status);
		console.log("Response headers:", response.headers);

		// Check content type before parsing
		const contentType = response.headers.get("content-type");

		if (!response.ok) {
			let errorData;

			if (contentType && contentType.includes("application/json")) {
				errorData = await response.json().catch(() => ({}));
			} else {
				const textResponse = await response.text();
				console.error(
					"Non-JSON response:",
					textResponse.substring(0, 500)
				);
				throw new Error(
					`Server error (${response.status}): Please check if the WordPress REST API is accessible`
				);
			}

			throw new Error(
				errorData.message || "Failed to submit quote request"
			);
		}

		// Even on 200, check if response is actually JSON
		if (!contentType || !contentType.includes("application/json")) {
			const textResponse = await response.text();
			console.error(
				"Expected JSON but got:",
				textResponse.substring(0, 1000)
			);
			throw new Error(
				"Server returned invalid response format. There may be a PHP error."
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
