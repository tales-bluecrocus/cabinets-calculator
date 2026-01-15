import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressStepperProps {
	currentStep: number;
	totalSteps: number;
}

const STEP_LABELS = [
	"Measure Your Kitchen",
	"Ceiling Configuration",
	"Island & Results",
];

export function ProgressStepper({
	currentStep,
	totalSteps,
}: ProgressStepperProps) {
	const progressValue = ((currentStep - 1) / (totalSteps - 1)) * 100;

	return (
		<div className="mb-6 md:mb-8">
			{/* Progress bar */}
			<Progress value={progressValue} className="h-2 mb-4" />

			{/* Step indicators */}
			<div className="flex justify-between px-2">
				{STEP_LABELS.map((label, index) => {
					const stepNumber = index + 1;
					const isActive = stepNumber === currentStep;
					const isCompleted = stepNumber < currentStep;

					return (
						<div
							key={stepNumber}
							className="flex flex-col items-center flex-1"
						>
							<div
								className={cn(
									"w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base font-medium transition-colors",
									isCompleted &&
										"bg-primary text-primary-foreground",
									isActive &&
										"bg-primary text-primary-foreground ring-4 ring-primary/20",
									!isActive &&
										!isCompleted &&
										"bg-muted text-muted-foreground"
								)}
							>
								{isCompleted ? "✓" : stepNumber}
							</div>
							<span
								className={cn(
									"text-xs sm:text-sm mt-2 text-center leading-tight px-1",
									isActive
										? "text-primary font-medium"
										: "text-muted-foreground"
								)}
							>
								{label}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}
