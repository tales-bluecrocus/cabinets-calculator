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
	const [currentStep, setCurrentStep] = useState(1);
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
			hasIsland: false,
			islandDimensions: undefined,
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

	const { trigger, getValues } = methods;

	// Calculate estimate when relevant values change
	const updateEstimate = useCallback(() => {
		const values = getValues();
		if (values.linearFeet && values.ceilingConfig) {
			const newEstimate = calculateEstimate({
				linearFeet: values.linearFeet,
				ceilingConfig: values.ceilingConfig,
				hasIsland: values.hasIsland || false,
				islandDimensions: values.islandDimensions,
			});
			setEstimate(newEstimate);
		}
	}, [getValues]);

	const handleNextStep = async () => {
		let fieldsToValidate: (keyof KitchenEstimateFormData)[] = [];
		let errorMessages: string[] = [];

		switch (currentStep) {
			case 1:
				fieldsToValidate = ["layoutType"];
				break;
			case 2:
				fieldsToValidate = ["ceilingConfig"];
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

		if (currentStep === 2) {
			updateEstimate();
		}
		setCurrentStep((prev) => Math.min(prev + 1, 3));

		// Scroll to top of the card
		const cardElement = document.querySelector(
			"#cabinet-calculator-root .max-w-4xl"
		);
		if (cardElement) {
			cardElement.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};

	const handlePrevStep = () => {
		setCurrentStep((prev) => Math.max(prev - 1, 1));

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
				hasIsland: data.hasIsland,
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
					<ProgressStepper currentStep={currentStep} totalSteps={3} />

					<FormProvider {...methods}>
						<form
							onSubmit={methods.handleSubmit(handleSubmit)}
							noValidate
						>
							{currentStep === 1 && (
								<StepLayoutMeasurement
									onNext={handleNextStep}
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
