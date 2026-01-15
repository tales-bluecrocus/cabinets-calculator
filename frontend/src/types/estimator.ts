// Kitchen layout types
export type LayoutType = "l-shape" | "u-shape" | "galley" | "single-wall";

// Ceiling configuration types
export type CeilingConfig =
	| "8ft-open"
	| "8ft-crown"
	| "8ft-ceiling"
	| "9ft-ceiling"
	| "10ft-ceiling";

// Island dimension types
export type IslandLength = number;
export type IslandWidth = number;

// Configuration type (what to include)
export type ConfigurationType = "kitchen" | "island" | "both";

// Form data structure
export interface KitchenEstimateForm {
	// Step 1 - Optional for island-only
	layoutType?: LayoutType;
	linearFeet?: number;

	// Step 2 - Optional for island-only
	ceilingConfig?: CeilingConfig;

	// Step 3
	configurationType: ConfigurationType;
	islandDimensions?: {
		length: IslandLength;
		width: IslandWidth;
	};

	// Lead capture
	customerInfo?: CustomerInfo;
}

export interface CustomerInfo {
	name: string;
	email: string;
	phone?: string;
	preferredContact: "email" | "phone" | "showroom";
	notes?: string;
}

// Calculated estimate result
export interface PricingEstimate {
	cabinet?: {
		linearFeet: number;
		pricePerFoot: number;
		subtotalLow: number;
		subtotalHigh: number;
	};
	island?: {
		dimensions: string;
		price: number;
	};
	total: {
		low: number;
		high: number;
	};
	disclaimers: string[];
	accuracyWarning?: string;
	timestamp: Date;
}

// Ceiling configuration details
export interface CeilingConfigDetails {
	label: string;
	description: string;
	pricePerFoot: number;
	image?: string;
}

// Layout type details
export interface LayoutTypeDetails {
	label: string;
	description: string;
	icon?: string;
	image?: string;
	measurementTip: string;
}

// Quote submission request
export interface QuoteSubmissionRequest {
	layoutType?: LayoutType;
	linearFeet?: number;
	ceilingConfig?: CeilingConfig;
	configurationType: ConfigurationType;
	islandDimensions?: {
		length: IslandLength;
		width: IslandWidth;
	};
	estimate: PricingEstimate;
	customerInfo: CustomerInfo;
}

// API response types
export interface ApiResponse {
	success: boolean;
	message: string;
	warning?: string;
}
