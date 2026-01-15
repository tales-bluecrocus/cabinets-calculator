import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LAYOUT_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { KitchenEstimateFormData } from "@/lib/validation";
import type { LayoutType } from "@/types/estimator";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { InlineToasts } from "@/components/ui/toast";

interface StepLayoutMeasurementProps {
	onNext: () => void;
	onBack: () => void;
}

export function StepLayoutMeasurement({
	onNext,
	onBack,
}: StepLayoutMeasurementProps) {
	const { watch, setValue } = useFormContext<KitchenEstimateFormData>();

	const selectedLayout = watch("layoutType");
	const linearFeet = watch("linearFeet");

	// Only show warning if linearFeet is a valid number and outside normal range
	const showWarning =
		typeof linearFeet === "number" &&
		!isNaN(linearFeet) &&
		linearFeet > 0 &&
		(linearFeet < 10 || linearFeet > 40);

	const layoutOptions = Object.entries(LAYOUT_TYPES) as [
		LayoutType,
		(typeof LAYOUT_TYPES)[LayoutType]
	][];

	return (
		<div className="space-y-6">
			<div className="text-center md:text-left">
				<h2 className="text-xl md:text-2xl font-semibold mb-2">
					Step 1: Measure Your Kitchen
				</h2>
				<p className="text-muted-foreground text-sm md:text-base">
					Select your kitchen layout and enter the total linear
					footage of cabinet walls.
				</p>
			</div>

			{/* Layout Selection */}
			<div className="space-y-4">
				<Label className="text-base md:text-lg font-medium">
					What's your kitchen layout?
				</Label>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
					{layoutOptions.map(([key, layout]) => (
						<button
							key={key}
							type="button"
							onClick={() => setValue("layoutType", key)}
							className={cn(
								"p-4 md:p-5 rounded-lg border-2 text-left transition-all min-h-[120px] md:min-h-[140px] flex flex-col",
								selectedLayout === key
									? "border-primary bg-primary/5"
									: "border-border bg-background hover:border-primary/50 active:bg-primary/5"
							)}
						>
							{layout.image && (
								<img
									src={layout.image}
									alt={layout.label}
									className="w-full h-20 object-contain mb-3 rounded"
								/>
							)}
							<div className="font-medium text-sm md:text-base">
								{layout.label}
							</div>
							<div className="text-muted-foreground text-xs md:text-sm mt-1">
								{layout.description}
							</div>
						</button>
					))}
				</div>
			</div>

			{/* Measurement Tip */}
			{selectedLayout && (
				<Alert className="bg-blue-50 border-blue-200">
					<AlertDescription className="text-blue-800">
						<strong>How to measure:</strong>{" "}
						{LAYOUT_TYPES[selectedLayout].measurementTip}
					</AlertDescription>
				</Alert>
			)}

			{/* Linear Footage Input */}
			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<Label
						htmlFor="linearFeet"
						className="text-base font-medium"
					>
						Total Linear Footage
					</Label>
				</div>

				<Slider
					value={[linearFeet || 15]}
					max={150}
					step={1}
					showTooltip
					tooltipContent={(val) => `${val} ft`}
					onValueChange={(value) => setValue("linearFeet", value[0])}
					className="py-6"
				/>

				<p className="text-xs text-muted-foreground">
					Measure the wall length where cabinets will be installed,
					not the cabinet face.
				</p>
			</div>

			{/* Warning for edge cases */}
			{showWarning && (
				<Alert
					variant="warning"
					className="bg-amber-50 border-amber-200"
				>
					<AlertDescription className="text-amber-800">
						{linearFeet < 10
							? "Small kitchens (under 10 LF) may have higher per-foot costs than shown."
							: "Large kitchens (over 120 LF) may benefit from a custom consultation for more accurate pricing."}
					</AlertDescription>
				</Alert>
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
					className="w-full sm:w-auto min-h-[48px] text-base order-1 sm:order-2"
				>
					Next Step
					<ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
