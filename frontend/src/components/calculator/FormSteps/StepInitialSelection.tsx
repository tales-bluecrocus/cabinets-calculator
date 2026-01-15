import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { KitchenEstimateFormData } from "@/lib/validation";
import { ArrowRight } from "lucide-react";

interface StepInitialSelectionProps {
	onNext: () => void;
}

export function StepInitialSelection({ onNext }: StepInitialSelectionProps) {
	const { watch, setValue } = useFormContext<KitchenEstimateFormData>();

	const configurationType = watch("configurationType");

	const handleConfigurationChange = (
		value: "kitchen" | "island" | "both"
	) => {
		const previousType = configurationType;

		// Always reset fields that don't apply to the new selection
		if (value === "island") {
			// Island only - always reset kitchen fields
			setValue("layoutType", undefined);
			setValue("linearFeet", undefined);
			setValue("ceilingConfig", undefined);
		} else if (value === "kitchen") {
			// Kitchen only - always reset island fields
			setValue("islandDimensions", undefined);
		} else if (value === "both") {
			// Both - reset only if coming from a single selection
			if (previousType === "island") {
				// Coming from island only - reset kitchen fields to defaults
				setValue("linearFeet", 15);
			}
			// Keep island dimensions if coming from kitchen, or reset to defaults
			if (previousType === "kitchen") {
				setValue("islandDimensions", { length: 6, width: 3 });
			}
		}

		setValue("configurationType", value);
	};

	const options = [
		{
			value: "both" as const,
			title: "Kitchen + Island",
			description: "Get estimates for both kitchen cabinets and island",
		},
		{
			value: "island" as const,
			title: "Island Only",
			description: "Get estimate for kitchen island only",
		},
		{
			value: "kitchen" as const,
			title: "Kitchen Only",
			description: "Get estimate for kitchen cabinets only",
		},
	];

	return (
		<div className="space-y-6">
			<div className="text-center">
				<h2 className="text-2xl md:text-3xl font-bold mb-3">
					What would you like to estimate?
				</h2>
				<p className="text-muted-foreground text-base md:text-lg">
					Choose what you need to get an accurate estimate
				</p>
			</div>

			<div className="space-y-4 max-w-2xl mx-auto">
				<Label className="sr-only">Select configuration type</Label>
				<div className="grid grid-cols-1 gap-4">
					{options.map((option) => (
						<button
							key={option.value}
							type="button"
							onClick={() =>
								handleConfigurationChange(option.value)
							}
							className={cn(
								"p-6 md:p-8 rounded-xl border-2 text-center transition-all",
								configurationType === option.value
									? "border-primary bg-primary/10 shadow-lg"
									: "border-border bg-background hover:border-primary/50 hover:shadow-md"
							)}
						>
							<div className="font-bold text-lg md:text-xl mb-2">
								{option.title}
							</div>
							<div className="text-muted-foreground text-sm md:text-base">
								{option.description}
							</div>
						</button>
					))}
				</div>
			</div>

			<div className="flex justify-center pt-6">
				<Button
					type="button"
					onClick={onNext}
					disabled={!configurationType}
					size="lg"
					className="w-full sm:w-auto min-h-[48px] text-base px-8"
				>
					Continue
					<ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
