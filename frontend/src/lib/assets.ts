/**
 * Asset URL Helper
 *
 * In production (WordPress), assets need the full plugin path.
 * In development, Vite serves them directly.
 */

declare global {
	interface Window {
		cabinetsCalculatorConfig?: {
			restUrl: string;
			nonce: string;
			pluginUrl: string;
			assetsUrl: string;
		};
	}
}

/**
 * Get the full URL for an asset
 * Prepends the plugin assets URL from WordPress config
 */
export function getAssetUrl(assetPath: string): string {
	// In production, use the WordPress plugin URL
	const assetsUrl =
		window.cabinetsCalculatorConfig?.assetsUrl ||
		"/wp-content/plugins/cabinets-calculator/frontend/dist/assets/";

	// Extract filename from the asset path
	// E.g., "/assets/Lshape.webp" -> "Lshape.webp"
	const filename = assetPath.split("/").pop() || assetPath;

	return assetsUrl + filename;
}
