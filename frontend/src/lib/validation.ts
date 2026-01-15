import { z } from "zod";


export const kitchenEstimateSchema = z
	.object({
		// Step 1
		layoutType: z.enum(
			["l-shape", "u-shape", "galley", "single-wall", "other"],
			{
				required_error: "Please select your kitchen layout",
			}
		),
		linearFeet: z
			.number({
				required_error: "Please enter linear footage",
				invalid_type_error: "Please enter a valid number",
			})
			.min(5, "Minimum 5 linear feet required")
			.max(150, "For kitchens over 150 LF, please contact us"),

		// Step 2
		ceilingConfig: z.enum(
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
		),

		// Step 3
		hasIsland: z.boolean().default(false),
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
			// If island is selected, dimensions must be provided
			if (data.hasIsland && !data.islandDimensions) {
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
