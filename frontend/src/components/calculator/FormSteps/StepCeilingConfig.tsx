import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CEILING_CONFIGS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { KitchenEstimateFormData } from "@/lib/validation";
import type { CeilingConfig } from "@/types/estimator";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Slider } from "@/components/ui/slider";
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
	const islandDimensions = watch("islandDimensions");

	// Ensure island dimensions are set if undefined
	if (!islandDimensions) {
		setValue("islandDimensions", { length: 6, width: 3 });
	}

	const ceilingOptions = Object.entries(CEILING_CONFIGS) as [
		CeilingConfig,
		(typeof CEILING_CONFIGS)[CeilingConfig]
	][];

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold mb-2">
					Step 2: Select Ceiling Configuration
				</h2>
				<p className="text-muted-foreground">
					Choose the cabinet style that matches your ceiling height
					and preference.
				</p>
			</div>

			{/* Ceiling Configuration Selection */}
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
								onClick={() => setValue("ceilingConfig", key)}
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

				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<Label className="text-base font-medium">
							Kitchen Island Configuration
						</Label>
					</div>

					<div className="p-4 bg-muted/30 rounded-lg border border-border space-y-6">
						<div className="space-y-3">
							<Label className="text-sm font-medium">
								Include Kitchen Island?
							</Label>
							<div className="grid grid-cols-2 gap-3">
								<button
									type="button"
									onClick={() => {
										setValue("hasIsland", true);
										onEstimateUpdate();
									}}
									className={cn(
										"p-3 rounded-md border text-center transition-all font-medium",
										watch("hasIsland")
											? "border-primary bg-primary/10 text-primary"
											: "border-border bg-background hover:bg-muted"
									)}
								>
									Yes
								</button>
								<button
									type="button"
									onClick={() => {
										setValue("hasIsland", false);
										onEstimateUpdate();
									}}
									className={cn(
										"p-3 rounded-md border text-center transition-all font-medium",
										!watch("hasIsland")
											? "border-primary bg-primary/10 text-primary"
											: "border-border bg-background hover:bg-muted"
									)}
								>
									No
								</button>
							</div>
						</div>

						{watch("hasIsland") && (
							<div className="space-y-6 animate-in slide-in-from-top-2 pt-2 border-t border-border/50">
								<div className="flex justify-between items-center mb-2">
									<Label className="text-sm font-medium">
										Dimensions
									</Label>
									{islandDimensions && (
										<span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">
											{islandDimensions.length}' x{" "}
											{islandDimensions.width}'
										</span>
									)}
								</div>

								<div className="space-y-4">
									<div className="flex justify-between">
										<Label>Length (ft)</Label>
									</div>
									<div className="pt-6 pb-2">
										<Slider
											value={[
												islandDimensions?.length || 6,
											]}
											min={4}
											max={10}
											step={0.1}
											showTooltip
											tooltipContent={(val: number) =>
												`${val} ft`
											}
											onValueChange={(val: number[]) => {
												setValue("islandDimensions", {
													length: val[0] as any,
													width:
														islandDimensions?.width ||
														3,
												});
												onEstimateUpdate();
											}}
										/>
									</div>
									<div className="flex justify-between text-xs text-muted-foreground">
										<span>4'</span>
										<span>10'</span>
									</div>
								</div>

								<div className="space-y-4">
									<div className="flex justify-between">
										<Label>Width (ft)</Label>
									</div>
									<div className="pt-6 pb-2">
										<Slider
											value={[
												islandDimensions?.width || 3,
											]}
											min={2}
											max={4}
											step={0.1}
											showTooltip
											tooltipContent={(val: number) =>
												`${val} ft`
											}
											onValueChange={(val: number[]) => {
												setValue("islandDimensions", {
													length:
														islandDimensions?.length ||
														6,
													width: val[0] as any,
												});
												onEstimateUpdate();
											}}
										/>
									</div>
									<div className="flex justify-between text-xs text-muted-foreground">
										<span>2'</span>
										<span>4'</span>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

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
		</div>
	);
}
