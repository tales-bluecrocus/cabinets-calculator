import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
	React.ElementRef<typeof SliderPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
		showTooltip?: boolean;
		tooltipContent?: (value: number) => React.ReactNode;
	}
>(({ className, showTooltip, tooltipContent, ...props }, ref) => {
	const value = props.value || props.defaultValue || [0];

	return (
		<SliderPrimitive.Root
			ref={ref}
			className={cn(
				"relative flex w-full touch-none select-none items-center",
				className
			)}
			{...props}
		>
			<SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-primary/20">
				<SliderPrimitive.Range className="absolute h-full bg-primary" />
			</SliderPrimitive.Track>
			<SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
				{showTooltip && (
					<div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 w-max rounded-md bg-primary px-3 py-1.5 text-base font-bold text-primary-foreground shadow-md animate-in fade-in-0 zoom-in-95">
						{tooltipContent ? tooltipContent(value[0]) : value[0]}
						{/* Arrow */}
						<div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-primary" />
					</div>
				)}
			</SliderPrimitive.Thumb>
		</SliderPrimitive.Root>
	);
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
