import {
	CEILING_CONFIGS,
	ISLAND_PRICES,
	ESTIMATE_DISCLAIMERS,
} from "./constants";
import type {
	KitchenEstimateForm,
	PricingEstimate,
	CeilingConfig,
} from "@/types/estimator";

/**
 * Calculate the complete estimate based on form inputs
 */
export function calculateEstimate(
	formData: Pick<
		KitchenEstimateForm,
		"linearFeet" | "ceilingConfig" | "hasIsland" | "islandDimensions"
	>
): PricingEstimate {
	// Cabinet calculation
	const config = CEILING_CONFIGS[formData.ceilingConfig as CeilingConfig];
	const pricePerFoot = config?.pricePerFoot || 350;
	const cabinetBase = formData.linearFeet * pricePerFoot;
	const cabinetLow = Math.round(cabinetBase);
	const cabinetHigh = Math.round(cabinetBase * 1.1); // 10% variance

	// Island calculation
	let islandPrice = 0;
	let islandDimensions = "";

	if (formData.hasIsland && formData.islandDimensions) {
		const { length, width } = formData.islandDimensions;
		const key = `${length}x${width}`;
		islandPrice = ISLAND_PRICES[key] || 0;
		islandDimensions = key;
	}

	// Total calculation
	const totalLow = cabinetLow + islandPrice;
	const totalHigh = cabinetHigh + islandPrice;

	// Accuracy warning based on linear footage
	let accuracyWarning: string | undefined;
	if (formData.linearFeet < 10) {
		accuracyWarning =
			"Small kitchens (under 10 LF) may have higher per-foot costs. This estimate may be conservative.";
	} else if (formData.linearFeet > 40) {
		accuracyWarning =
			"Large kitchens (over 40 LF) may require custom pricing. We recommend scheduling a consultation for accurate pricing.";
	}

	return {
		cabinet: {
			linearFeet: formData.linearFeet,
			pricePerFoot,
			subtotalLow: cabinetLow,
			subtotalHigh: cabinetHigh,
		},
		...(formData.hasIsland &&
			islandPrice > 0 && {
				island: {
					dimensions: islandDimensions,
					price: islandPrice,
				},
			}),
		total: {
			low: totalLow,
			high: totalHigh,
		},
		disclaimers: [...ESTIMATE_DISCLAIMERS],
		accuracyWarning,
		timestamp: new Date(),
	};
}

/**
 * Get island price by dimensions
 */
export function getIslandPrice(length: number, width: number): number {
	const key = `${length}x${width}`;
	return ISLAND_PRICES[key] || 0;
}

/**
 * Validate linear footage input
 */
export function validateLinearFeet(value: number): string | true {
	if (value < 5) {
		return "Minimum 5 linear feet required";
	}
	if (value > 50) {
		return "For kitchens over 50 linear feet, please contact us directly";
	}
	return true;
}
