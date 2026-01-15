import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CEILING_CONFIGS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { KitchenEstimateFormData } from "@/lib/validation";
import type { CeilingConfig } from "@/types/estimator";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { InlineToasts } from "@/components/ui/toast";

interface StepCeilingConfigProps {
	onNext: () => void;
	onBack: () => void;
	onEstimateUpdate: () => void;
}

export function StepCeilingConfig({
	onNext,
	onBack,
	onEstimateUpdate,
}: StepCeilingConfigProps) {
	const { watch, setValue } = useFormContext<KitchenEstimateFormData>();

	const selectedConfig = watch("ceilingConfig");
	const configurationType = watch("configurationType");
	const islandDimensions = watch("islandDimensions");

	const showIslandOptions =
		configurationType === "island" || configurationType === "both";

	const handleLengthChange = (value: string) => {
		const newLength = parseInt(value, 10);
		const currentWidth = islandDimensions?.width || 3;
		setValue(
			"islandDimensions",
			{
				length: newLength,
				width: currentWidth,
			},
			{ shouldValidate: true }
		);
		onEstimateUpdate();
	};

	const handleWidthChange = (value: string) => {
		const newWidth = parseInt(value, 10);
		const currentLength = islandDimensions?.length || 6;
		setValue(
			"islandDimensions",
			{
				length: currentLength,
				width: newWidth,
			},
			{ shouldValidate: true }
		);
		onEstimateUpdate();
	};

	const ceilingOptions = Object.entries(CEILING_CONFIGS) as [
		CeilingConfig,
		(typeof CEILING_CONFIGS)[CeilingConfig]
	][];

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold mb-2">
					{configurationType === "island"
						? "Configure Your Island"
						: "Step 2: Select Ceiling Configuration"}
				</h2>
				<p className="text-muted-foreground">
					{configurationType === "island"
						? "Choose the dimensions for your kitchen island."
						: "Choose the cabinet style that matches your ceiling height and preference."}
				</p>
			</div>

			{/* Ceiling Configuration Selection - Only show for kitchen configurations */}
			{configurationType !== "island" && (
				<div className="space-y-4">
					<Label className="text-base md:text-lg font-medium">
						Select your ceiling configuration
					</Label>
					<div className="space-y-3">
						{ceilingOptions.map(([key, config]) => {
							const isSelected = selectedConfig === key;

							return (
								<button
									key={key}
									type="button"
									onClick={() =>
										setValue("ceilingConfig", key)
									}
									className={cn(
										"p-4 md:p-5 rounded-lg border-2 text-left transition-all w-full",
										isSelected
											? "border-primary bg-primary/5"
											: "border-border bg-background hover:border-primary/50 active:bg-primary/5"
									)}
								>
									<div className="font-medium text-sm md:text-base break-words hyphens-auto">
										{config.label}
									</div>
									<div className="text-xs md:text-sm text-muted-foreground mt-1 break-words hyphens-auto leading-relaxed">
										{config.description}
									</div>
								</button>
							);
						})}
					</div>
				</div>
			)}

			{/* Island Dimensions - Only show when island is selected */}
			{showIslandOptions && (
				<div className="space-y-4">
					<Label className="text-base font-medium">
						Island Dimensions
					</Label>
					<div className="p-4 bg-muted/30 rounded-lg border border-border space-y-6">
						<div className="space-y-6 animate-in slide-in-from-top-2">
							<div className="flex justify-between items-center mb-2">
								{islandDimensions && (
									<span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">
										{islandDimensions.length}' x{" "}
										{islandDimensions.width}'
									</span>
								)}
							</div>
							<div className="flex justify-between items-center mb-2 space-y-6">
								<div className="space-y-4 w-full mr-2">
									<Label>Length (ft)</Label>
									<Select
										value={String(
											islandDimensions?.length || 6
										)}
										onValueChange={handleLengthChange}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select length" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="4">
												4 ft
											</SelectItem>
											<SelectItem value="5">
												5 ft
											</SelectItem>
											<SelectItem value="6">
												6 ft
											</SelectItem>
											<SelectItem value="7">
												7 ft
											</SelectItem>
											<SelectItem value="8">
												8 ft
											</SelectItem>
											<SelectItem value="9">
												9 ft
											</SelectItem>
											<SelectItem value="10">
												10 ft
											</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-4 w-full ml-2">
									<Label>Width (ft)</Label>
									<Select
										value={String(
											islandDimensions?.width || 3
										)}
										onValueChange={handleWidthChange}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select width" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="2">
												2 ft
											</SelectItem>
											<SelectItem value="3">
												3 ft
											</SelectItem>
											<SelectItem value="4">
												4 ft
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			<InlineToasts />

			{/* Navigation */}
			<div className="flex flex-col sm:flex-row gap-3 sm:justify-between pt-6">
				<Button
					type="button"
					variant="outline"
					onClick={onBack}
					size="lg"
					className="w-full sm:w-auto min-h-[48px] order-2 sm:order-1"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back
				</Button>
				<Button
					type="button"
					onClick={onNext}
					size="lg"
					className="w-full sm:w-auto min-h-[48px] order-1 sm:order-2"
				>
					Next Step
					<ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
