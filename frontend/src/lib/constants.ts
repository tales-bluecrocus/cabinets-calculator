import type {
	CeilingConfig,
	CeilingConfigDetails,
	LayoutType,
	LayoutTypeDetails,
} from "@/types/estimator";
import { getAssetUrl } from "@/lib/assets";

// Ceiling configuration pricing and details
export const CEILING_CONFIGS: Record<CeilingConfig, CeilingConfigDetails> = {
	"8ft-open": {
		label: "8ft Ceiling - Open Top",
		description:
			"Standard cabinets with open space above, no crown molding",
		pricePerFoot: 350,
	},
	"8ft-crown": {
		label: "8ft Ceiling - Crown Molding",
		description: "Standard cabinets with top-mount crown molding",
		pricePerFoot: 401,
	},
	"8ft-ceiling": {
		label: "8ft Ceiling - To Ceiling",
		description: '36" upper cabinets extended to ceiling with molding',
		pricePerFoot: 435,
	},
	"9ft-ceiling": {
		label: "9ft Ceiling - To Ceiling",
		description: "Full-height cabinets for 9ft ceilings",
		pricePerFoot: 480,
	},
	"10ft-ceiling": {
		label: "10ft Ceiling - Stacked",
		description: 'Tallest cabinets with additional 12" upper section',
		pricePerFoot: 571,
	},
} as const;

// Island pricing matrix (length x width = price)
export const ISLAND_PRICES: Record<string, number> = {
	"4x2": 2350,
	"4x3": 3266,
	"4x4": 3872,
	"5x2": 2500,
	"5x3": 3600,
	"5x4": 4296,
	"6x2": 2628,
	"6x3": 3930,
	"6x4": 4556,
	"7x2": 3034,
	"7x3": 4547,
	"7x4": 5272,
	"8x2": 3225,
	"8x3": 4848,
	"8x4": 5590,
	"9x2": 3615,
	"9x3": 5252,
	"9x4": 6155,
	"10x3": 5935,
	"10x4": 6869,
} as const;

// Layout type details
export const LAYOUT_TYPES: Record<LayoutType, LayoutTypeDetails> = {
	"l-shape": {
		label: "L-Shaped",
		description: "Two walls forming an L shape",
		image: getAssetUrl("Lshape.webp"),
		measurementTip:
			"Measure both walls from corner to end. Example: 10ft + 8ft = 18 linear feet",
	},
	"u-shape": {
		label: "U-Shaped",
		description: "Three walls forming a U shape",
		image: getAssetUrl("Ushape.webp"),
		measurementTip:
			"Measure all three walls. Example: 10ft + 6ft + 10ft = 26 linear feet",
	},
	galley: {
		label: "Galley",
		description: "Two parallel walls",
		image: getAssetUrl("double.webp"),
		measurementTip:
			"Measure both parallel walls. Example: 12ft + 12ft = 24 linear feet",
	},
	"single-wall": {
		label: "Single Wall",
		description: "Cabinets along one wall",
		image: getAssetUrl("single.webp"),
		measurementTip:
			"Measure the full wall length. Example: 15ft = 15 linear feet",
	},
} as const;

// Available island sizes for selection
export const AVAILABLE_ISLAND_SIZES = [
	{ length: 4, width: 2, label: "4ft × 2ft" },
	{ length: 4, width: 3, label: "4ft × 3ft" },
	{ length: 4, width: 4, label: "4ft × 4ft" },
	{ length: 5, width: 2, label: "5ft × 2ft" },
	{ length: 5, width: 3, label: "5ft × 3ft" },
	{ length: 5, width: 4, label: "5ft × 4ft" },
	{ length: 6, width: 2, label: "6ft × 2ft" },
	{ length: 6, width: 3, label: "6ft × 3ft" },
	{ length: 6, width: 4, label: "6ft × 4ft" },
	{ length: 7, width: 2, label: "7ft × 2ft" },
	{ length: 7, width: 3, label: "7ft × 3ft" },
	{ length: 7, width: 4, label: "7ft × 4ft" },
	{ length: 8, width: 2, label: "8ft × 2ft" },
	{ length: 8, width: 3, label: "8ft × 3ft" },
	{ length: 8, width: 4, label: "8ft × 4ft" },
	{ length: 9, width: 2, label: "9ft × 2ft" },
	{ length: 9, width: 3, label: "9ft × 3ft" },
	{ length: 9, width: 4, label: "9ft × 4ft" },
	{ length: 10, width: 3, label: "10ft × 3ft" },
	{ length: 10, width: 4, label: "10ft × 4ft" },
] as const;

// Disclaimers to show with every estimate
export const ESTIMATE_DISCLAIMERS = [
	"This is a ballpark estimate only, not a final quote",
	"Final pricing depends on specific layout and cabinet selections",
	"Most accurate for kitchens between 10-40 linear feet",
	"Does not include: delivery, installation, countertops, or hardware",
	"Free design consultation is included",
] as const;

// What's included in the estimate
export const WHATS_INCLUDED = [
	"Base cabinets",
	"Wall cabinets",
	"Pantry cabinets",
	"Crown molding (if selected)",
	"Free design consultation",
	"All standard finishes",
] as const;

// What's NOT included in the estimate
export const WHATS_NOT_INCLUDED = [
	"Delivery & installation",
	"Countertops",
	"Hardware (pulls/knobs)",
	"Pullout accessories",
	"Appliances",
	"Plumbing/electrical work",
] as const;
