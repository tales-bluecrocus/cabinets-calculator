import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { WHATS_INCLUDED, WHATS_NOT_INCLUDED } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { KitchenEstimateFormData } from "@/lib/validation";
import type { PricingEstimate } from "@/types/estimator";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

interface StepIslandResultsProps {
	estimate: PricingEstimate | null;
	onBack: () => void;
	onEstimateUpdate: () => void;
	isSubmitting: boolean;
	submitStatus: { success: boolean; message: string } | null;
}

export function StepIslandResults({
	estimate,
	onBack,
	onEstimateUpdate,
	isSubmitting,
	submitStatus,
}: StepIslandResultsProps) {
	const {
		register,
		watch,
		setValue,
		formState: { errors },
	} = useFormContext<KitchenEstimateFormData>();

	const { addToast } = useToast();
	const configurationType = watch("configurationType");
	const islandDimensions = watch("islandDimensions");

	// Show error toast when submission fails
	useEffect(() => {
		if (submitStatus && !submitStatus.success) {
			addToast({ type: "error", message: submitStatus.message });
		}
	}, [submitStatus, addToast]);
	const customerInfo = watch("customerInfo");

	// Update estimate when island selection changes
	useEffect(() => {
		onEstimateUpdate();
	}, [configurationType, islandDimensions, onEstimateUpdate]);

	if (submitStatus?.success) {
		return (
			<div className="text-center py-8">
				<CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
				<h2 className="text-2xl font-bold mb-2">Thank You!</h2>
				<p className="text-muted-foreground mb-6">
					{submitStatus.message}
				</p>

				{estimate && (
					<div className="bg-primary/5 border border-primary/20 rounded-lg p-6 max-w-md mx-auto mb-6">
						<h3 className="font-semibold text-lg mb-2">
							Your Estimate
						</h3>
						<p className="text-3xl font-bold text-primary">
							${estimate.total.low.toLocaleString()}
						</p>
						<p className="text-xs text-muted-foreground mt-2">
							A detailed quote has been sent to your email
						</p>
					</div>
				)}

				<div className="bg-muted rounded-lg p-6 max-w-md mx-auto">
					<h3 className="font-semibold mb-2">What happens next?</h3>
					<ul className="text-sm text-left space-y-2 text-muted-foreground">
						<li>• Our design team will review your estimate</li>
						<li>• We'll contact you within 24 hours</li>
						<li>• Schedule your free design consultation</li>
						<li>• Get a precise quote for your dream kitchen</li>
					</ul>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Step Header */}
			<div>
				<h2 className="text-xl font-semibold mb-2">
					Step 3: Review & Request Quote
				</h2>
				<p className="text-muted-foreground">
					Review your kitchen details and submit your information to
					get a free consultation.
				</p>
			</div>

			{/* Configuration Review */}
			<div className="space-y-4">
				<div className="p-4 bg-muted/30 rounded-lg border border-border space-y-4">
					<h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-4">
						Your Configuration
					</h3>

					<div className="grid grid-cols-2 gap-4 text-sm">
						<div>
							<span className="block text-muted-foreground">
								Kitchen Layout
							</span>
							<span className="font-medium capitalize">
								{watch("layoutType")?.replace("-", " ") || "-"}
							</span>
						</div>
						<div>
							<span className="block text-muted-foreground">
								Linear Footage
							</span>
							<span className="font-medium">
								{watch("linearFeet")} ft
							</span>
						</div>
						<div>
							<span className="block text-muted-foreground">
								Ceiling Config
							</span>
							<span className="font-medium">
								{watch("ceilingConfig")?.replace("ft-", "' ")}
							</span>
						</div>
						<div>
							<span className="block text-muted-foreground">
								Kitchen Island
							</span>
							{configurationType === "both" ||
							configurationType === "island" ? (
								<span className="font-medium">
									{watch("islandDimensions")?.length}' x{" "}
									{watch("islandDimensions")?.width}'
								</span>
							) : (
								<span className="font-medium text-muted-foreground/70">
									None
								</span>
							)}
						</div>
					</div>
				</div>
			</div>

			<Separator />

			{/* Hidden fields for estimate data - sent via email only */}
			{estimate && (
				<>
					{estimate.cabinet && (
						<>
							<input
								type="hidden"
								name="estimate_linear_feet"
								value={estimate.cabinet.linearFeet}
							/>
							<input
								type="hidden"
								name="estimate_price_per_foot"
								value={estimate.cabinet.pricePerFoot}
							/>
							<input
								type="hidden"
								name="estimate_cabinet_low"
								value={estimate.cabinet.subtotalLow}
							/>
							<input
								type="hidden"
								name="estimate_cabinet_high"
								value={estimate.cabinet.subtotalHigh}
							/>
						</>
					)}
					<input
						type="hidden"
						name="estimate_total_low"
						value={estimate.total.low}
					/>
					<input
						type="hidden"
						name="estimate_total_high"
						value={estimate.total.high}
					/>
					{estimate.island && (
						<>
							<input
								type="hidden"
								name="estimate_island_dimensions"
								value={estimate.island.dimensions}
							/>
							<input
								type="hidden"
								name="estimate_island_price"
								value={estimate.island.price}
							/>
						</>
					)}
				</>
			)}

			{/* Confirmation message - no prices shown */}
			<div className="rounded-lg p-5 bg-primary/5 border border-primary/20">
				<h3 className="font-semibold text-lg text-primary mb-2">
					✓ Your Configuration is Ready
				</h3>
				<p className="text-sm text-foreground">
					We have all the information we need to prepare your
					personalized estimate. Submit your details below and we'll
					send you a detailed quote via email.
				</p>
			</div>

			{/* What's Included/Excluded */}
			<div className="grid md:grid-cols-2 gap-4">
				<div className="rounded-lg p-4 bg-green-50 border border-green-200">
					<h4 className="font-medium text-green-800 mb-3">
						✓ What's Included
					</h4>
					<ul className="text-sm text-green-700 space-y-1.5">
						{WHATS_INCLUDED.map((item) => (
							<li key={item}>• {item}</li>
						))}
					</ul>
				</div>
				<div className="rounded-lg p-4 bg-muted border border-border">
					<h4 className="font-medium text-muted-foreground mb-3">
						✗ Not Included
					</h4>
					<ul className="text-sm text-muted-foreground space-y-1.5">
						{WHATS_NOT_INCLUDED.map((item) => (
							<li key={item}>• {item}</li>
						))}
					</ul>
				</div>
			</div>

			<Separator />

			{/* Lead Capture Form */}
			<div className="space-y-5">
				<div>
					<h3 className="font-semibold text-lg">
						Get Your Free Design Consultation
					</h3>
					<p className="text-sm text-muted-foreground mt-1">
						Fill out the form below and our team will contact you to
						discuss your project.
					</p>
				</div>

				<div className="grid md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="name">
							Name <span className="text-destructive">*</span>
						</Label>
						<Input
							id="name"
							type="text"
							placeholder="Your full name"
							className={cn(
								errors.customerInfo?.name &&
									"border-destructive focus-visible:ring-destructive"
							)}
							{...register("customerInfo.name")}
						/>
						{errors.customerInfo?.name && (
							<p className="text-sm font-medium text-destructive">
								{errors.customerInfo.name.message}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="email">
							Email <span className="text-destructive">*</span>
						</Label>
						<Input
							id="email"
							type="email"
							placeholder="your@email.com"
							className={cn(
								errors.customerInfo?.email &&
									"border-destructive focus-visible:ring-destructive"
							)}
							{...register("customerInfo.email")}
						/>
						{errors.customerInfo?.email && (
							<p className="text-sm font-medium text-destructive">
								{errors.customerInfo.email.message}
							</p>
						)}
					</div>
				</div>

				<div className="grid md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="phone">
							Phone{" "}
							<span className="text-muted-foreground text-xs">
								(optional)
							</span>
						</Label>
						<Input
							id="phone"
							type="tel"
							placeholder="(555) 123-4567"
							maxLength={14}
							onChange={(e) => {
								// Format phone number: (XXX) XXX-XXXX
								let val = e.target.value.replace(/\D/g, "");
								if (val.length > 10) val = val.substring(0, 10);
								if (val.length > 6)
									val = `(${val.substring(
										0,
										3
									)}) ${val.substring(3, 6)}-${val.substring(
										6
									)}`;
								else if (val.length > 3)
									val = `(${val.substring(
										0,
										3
									)}) ${val.substring(3)}`;
								else if (val.length > 0) val = `(${val}`;

								setValue("customerInfo.phone", val);
							}}
						/>
					</div>

					<div className="space-y-2">
						<Label>Preferred Contact Method</Label>
						<Select
							value={customerInfo?.preferredContact || "email"}
							onValueChange={(value) =>
								setValue(
									"customerInfo.preferredContact",
									value as "email" | "phone" | "showroom"
								)
							}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select contact method" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="email">Email</SelectItem>
								<SelectItem value="phone">Phone</SelectItem>
								<SelectItem value="showroom">
									Showroom
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="notes">
						Additional Notes{" "}
						<span className="text-muted-foreground text-xs">
							(optional)
						</span>
					</Label>
					<Textarea
						id="notes"
						placeholder="Tell us about your project, timeline, or any questions you have..."
						rows={3}
						{...register("customerInfo.notes")}
					/>
				</div>
			</div>

			{/* Disclaimer */}
			<Alert className="bg-muted border-border">
				<AlertTitle className="font-semibold">Important</AlertTitle>
				<AlertDescription className="text-sm text-muted-foreground">
					This is a ballpark estimate only, not a final quote. Final
					pricing depends on specific layout and cabinet selections.
					Our free design consultation will provide accurate pricing
					for your project.
				</AlertDescription>
			</Alert>

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
					type="submit"
					size="lg"
					disabled={isSubmitting}
					className="w-full sm:w-auto min-h-[48px] order-1 sm:order-2"
				>
					{isSubmitting ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Submitting...
						</>
					) : (
						"Get My Free Consultation"
					)}
				</Button>
			</div>
		</div>
	);
}
