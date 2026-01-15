import { useState, useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	kitchenEstimateSchema,
	type KitchenEstimateFormData,
} from "@/lib/validation";
import { calculateEstimate } from "@/lib/calculations";
import { submitQuoteRequest } from "@/lib/api";
import { ProgressStepper } from "@/components/calculator/ProgressStepper";
import { StepInitialSelection } from "@/components/calculator/FormSteps/StepInitialSelection";
import { StepLayoutMeasurement } from "@/components/calculator/FormSteps/StepLayoutMeasurement";
import { StepCeilingConfig } from "@/components/calculator/FormSteps/StepCeilingConfig";
import { StepIslandResults } from "@/components/calculator/FormSteps/StepIslandResults";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { useToast, ToastProvider } from "@/components/ui/toast";
import type { PricingEstimate } from "@/types/estimator";

function AppContent() {
	const [currentStep, setCurrentStep] = useState(0);
	const [estimate, setEstimate] = useState<PricingEstimate | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitStatus, setSubmitStatus] = useState<{
		success: boolean;
		message: string;
	} | null>(null);

	const { addToast } = useToast();

	const methods = useForm<KitchenEstimateFormData>({
		resolver: zodResolver(kitchenEstimateSchema),
		defaultValues: {
			layoutType: undefined,
			linearFeet: 15,
			ceilingConfig: undefined,
			configurationType: "both",
			islandDimensions: { length: 6, width: 3 },
			customerInfo: {
				name: "",
				email: "",
				phone: "",
				preferredContact: "email",
				notes: "",
			},
		},
		mode: "onChange",
	});

	const { trigger, getValues, watch } = methods;

	// Get the current configuration type
	const configurationType = watch("configurationType");

	// Helper function to determine the next step based on configuration type
	const getNextStep = (currentStep: number): number => {
		// Step 0 -> Determine next based on configuration
		if (currentStep === 0) {
			// Island Only skips kitchen layout (step 1)
			if (configurationType === "island") {
				return 2;
			}
			// Kitchen Only and Both go to layout selection
			return 1;
		}
		// Step 1 -> Always go to step 2
		if (currentStep === 1) {
			return 2;
		}
		// Step 2 -> Always go to step 3 (results)
		if (currentStep === 2) {
			return 3;
		}
		return currentStep + 1;
	};

	// Helper function to determine the previous step
	const getPrevStep = (currentStep: number): number => {
		// Step 2 -> Go back based on configuration
		if (currentStep === 2) {
			// Island Only goes back to step 0
			if (configurationType === "island") {
				return 0;
			}
			// Kitchen Only and Both go back to step 1
			return 1;
		}
		// Step 1 -> Always go back to step 0
		if (currentStep === 1) {
			return 0;
		}
		return Math.max(currentStep - 1, 0);
	};

	// Calculate estimate when relevant values change
	const updateEstimate = useCallback(() => {
		const values = getValues();

		// For island only, only island dimensions are needed
		if (values.configurationType === "island") {
			if (values.islandDimensions) {
				const newEstimate = calculateEstimate({
					linearFeet: undefined,
					ceilingConfig: undefined,
					configurationType: values.configurationType,
					islandDimensions: values.islandDimensions,
				});
				setEstimate(newEstimate);
			}
		}
		// For kitchen only or both, need kitchen fields
		else if (values.linearFeet && values.ceilingConfig) {
			const newEstimate = calculateEstimate({
				linearFeet: values.linearFeet,
				ceilingConfig: values.ceilingConfig,
				configurationType: values.configurationType || "both",
				islandDimensions: values.islandDimensions,
			});
			setEstimate(newEstimate);
		}
	}, [getValues]);

	const handleNextStep = async () => {
		let fieldsToValidate: (keyof KitchenEstimateFormData)[] = [];
		let errorMessages: string[] = [];

		switch (currentStep) {
			case 0:
				// Step 0: Just configuration type selection, no validation needed
				break;
			case 1:
				// Step 1: Layout selection (only for kitchen/both)
				if (
					configurationType === "kitchen" ||
					configurationType === "both"
				) {
					fieldsToValidate = ["layoutType"];
				}
				break;
			case 2:
				// Step 2: Ceiling config (for kitchen/both) or island dimensions (for island/both)
				if (configurationType !== "island") {
					fieldsToValidate = ["ceilingConfig"];
				}
				// Island dimensions validation happens automatically through schema
				break;
		}

		const isValid = await trigger(fieldsToValidate);

		if (!isValid) {
			// Collect error messages for toast
			const errors = methods.formState.errors;

			if (currentStep === 1) {
				if (errors.layoutType) {
					errorMessages.push("Please select your kitchen layout");
				}
			} else if (currentStep === 2) {
				if (errors.ceilingConfig) {
					errorMessages.push("Please select a ceiling configuration");
				}
			}

			// Show toast for each error
			errorMessages.forEach((msg) => {
				addToast({ type: "error", message: msg });
			});
			return;
		}

		if (currentStep === 3) {
			updateEstimate();
		}

		// Use conditional navigation based on configuration type
		const nextStep = getNextStep(currentStep);
		setCurrentStep(nextStep);

		// Scroll to top of the card
		const cardElement = document.querySelector(
			"#cabinet-calculator-root .max-w-4xl"
		);
		if (cardElement) {
			cardElement.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};

	const handlePrevStep = () => {
		const prevStep = getPrevStep(currentStep);
		setCurrentStep(prevStep);

		// Scroll to top of the card
		const cardElement = document.querySelector(
			"#cabinet-calculator-root .max-w-4xl"
		);
		if (cardElement) {
			cardElement.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};

	const handleSubmit = async (data: KitchenEstimateFormData) => {
		if (!estimate || !data.customerInfo) return;

		// Validate customer info
		const customerErrors: string[] = [];
		if (!data.customerInfo.name?.trim()) {
			customerErrors.push("Please enter your name");
		}
		if (!data.customerInfo.email?.trim()) {
			customerErrors.push("Please enter your email");
		} else if (
			!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customerInfo.email)
		) {
			customerErrors.push("Please enter a valid email address");
		}

		if (customerErrors.length > 0) {
			customerErrors.forEach((msg) => {
				addToast({ type: "error", message: msg });
			});
			return;
		}

		setIsSubmitting(true);
		setSubmitStatus(null);

		try {
			const result = await submitQuoteRequest({
				layoutType: data.layoutType,
				linearFeet: data.linearFeet,
				ceilingConfig: data.ceilingConfig,
				configurationType: data.configurationType,
				islandDimensions: data.islandDimensions,
				estimate,
				customerInfo: data.customerInfo,
			});

			setSubmitStatus({
				success: result.success,
				message: result.message,
			});

			if (result.success) {
				// Scroll to top when showing thank you page
				setTimeout(() => {
					const cardElement = document.querySelector(
						"#cabinet-calculator-root .max-w-4xl"
					);
					if (cardElement) {
						cardElement.scrollIntoView({
							behavior: "smooth",
							block: "start",
						});
					}
				}, 100);
			}
		} catch (error) {
			const errorMessage =
				"An error occurred. Please try again or contact us directly.";
			setSubmitStatus({
				success: false,
				message: errorMessage,
			});
			addToast({ type: "error", message: errorMessage });
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="max-w-4xl mx-auto p-3 md:p-6 relative">
			<Card className="border-0 shadow-lg overflow-hidden">
				<CardHeader className="bg-primary text-primary-foreground px-4 py-6 md:px-6">
					<CardTitle className="text-xl md:text-3xl text-center leading-tight">
						Kitchen Cabinet Pricing Estimator
					</CardTitle>
					<CardDescription className="text-primary-foreground/80 text-center text-sm md:text-base">
						Get a transparent ballpark estimate for your dream
						kitchen
					</CardDescription>
				</CardHeader>

				<CardContent className="p-4 md:p-6">
					<ProgressStepper currentStep={currentStep} totalSteps={4} />

					<FormProvider {...methods}>
						<form
							onSubmit={methods.handleSubmit(handleSubmit)}
							noValidate
						>
							{currentStep === 0 && (
								<StepInitialSelection onNext={handleNextStep} />
							)}

							{currentStep === 1 && (
								<StepLayoutMeasurement
									onNext={handleNextStep}
									onBack={handlePrevStep}
								/>
							)}

							{currentStep === 2 && (
								<StepCeilingConfig
									onNext={handleNextStep}
									onBack={handlePrevStep}
									onEstimateUpdate={updateEstimate}
								/>
							)}

							{currentStep === 3 && (
								<StepIslandResults
									estimate={estimate}
									onBack={handlePrevStep}
									onEstimateUpdate={updateEstimate}
									isSubmitting={isSubmitting}
									submitStatus={submitStatus}
								/>
							)}
						</form>
					</FormProvider>
				</CardContent>
			</Card>

			{/* Trust badges / footer */}
			<div className="mt-6 text-center text-sm">
				<p className="text-muted-foreground">
					Premium Kitchen Cabinetry • Free Design Consultation
				</p>
				<p className="text-muted-foreground mt-1">
					Questions? Call us or visit our showroom
				</p>
			</div>
		</div>
	);
}

function App() {
	return (
		<ToastProvider>
			<AppContent />
		</ToastProvider>
	);
}

export default App;
