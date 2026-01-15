import { z } from "zod";

export const kitchenEstimateSchema = z
	.object({
		// Step 1 - Optional for island-only configurations
		layoutType: z
			.enum(["l-shape", "u-shape", "galley", "single-wall"], {
				required_error: "Please select your kitchen layout",
			})
			.optional(),
		linearFeet: z
			.number({
				required_error: "Please enter linear footage",
				invalid_type_error: "Please enter a valid number",
			})
			.int("Linear feet must be a whole number")
			.min(5, "Minimum 5 linear feet required")
			.max(150, "For kitchens over 150 LF, please contact us")
			.optional(),

		// Step 2 - Optional for island-only configurations
		ceilingConfig: z
			.enum(
				[
					"8ft-open",
					"8ft-crown",
					"8ft-ceiling",
					"9ft-ceiling",
					"10ft-ceiling",
				],
				{
					required_error: "Please select a ceiling configuration",
				}
			)
			.optional(),

		// Step 3
		configurationType: z
			.enum(["kitchen", "island", "both"], {
				required_error: "Please select what to include",
			})
			.default("both"),
		islandDimensions: z
			.object({
				length: z.number().min(4).max(10),
				width: z.number().min(2).max(4),
			})
			.optional(),

		// Lead capture
		customerInfo: z
			.object({
				name: z.string().min(2, "Name is required"),
				email: z.string().email("Valid email is required"),
				phone: z.string().optional(),
				preferredContact: z
					.enum(["email", "phone", "showroom"])
					.default("email"),
				notes: z
					.string()
					.max(500, "Notes must be 500 characters or less")
					.optional(),
			})
			.optional(),
	})
	.refine(
		(data) => {
			// Kitchen-only and Both require layoutType
			if (
				(data.configurationType === "kitchen" ||
					data.configurationType === "both") &&
				!data.layoutType
			) {
				return false;
			}
			return true;
		},
		{
			message: "Please select your kitchen layout",
			path: ["layoutType"],
		}
	)
	.refine(
		(data) => {
			// Kitchen-only and Both require linearFeet
			if (
				(data.configurationType === "kitchen" ||
					data.configurationType === "both") &&
				!data.linearFeet
			) {
				return false;
			}
			return true;
		},
		{
			message: "Please enter linear footage",
			path: ["linearFeet"],
		}
	)
	.refine(
		(data) => {
			// Kitchen-only and Both require ceilingConfig
			if (
				(data.configurationType === "kitchen" ||
					data.configurationType === "both") &&
				!data.ceilingConfig
			) {
				return false;
			}
			return true;
		},
		{
			message: "Please select a ceiling configuration",
			path: ["ceilingConfig"],
		}
	)
	.refine(
		(data) => {
			// If island is selected, dimensions must be provided
			if (
				(data.configurationType === "island" ||
					data.configurationType === "both") &&
				!data.islandDimensions
			) {
				return false;
			}
			return true;
		},
		{
			message: "Please select island dimensions",
			path: ["islandDimensions"],
		}
	);

export type KitchenEstimateFormData = z.infer<typeof kitchenEstimateSchema>;

// Schema for just customer info (used in step 3)
export const customerInfoSchema = z.object({
	name: z.string().min(2, "Name is required"),
	email: z.string().email("Valid email is required"),
	phone: z.string().optional(),
	preferredContact: z.enum(["email", "phone", "showroom"]).default("email"),
	notes: z
		.string()
		.max(500, "Notes must be 500 characters or less")
		.optional(),
});

export type CustomerInfoFormData = z.infer<typeof customerInfoSchema>;
