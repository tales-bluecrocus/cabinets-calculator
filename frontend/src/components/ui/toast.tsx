import * as React from "react";
import { cn } from "@/lib/utils";
import {
	X,
	AlertCircle,
	CheckCircle2,
	AlertTriangle,
	Info,
} from "lucide-react";

export interface Toast {
	id: string;
	type: "success" | "error" | "warning" | "info";
	message: string;
	duration?: number;
}

interface ToastContextType {
	toasts: Toast[];
	addToast: (toast: Omit<Toast, "id">) => void;
	removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(
	undefined
);

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = React.useState<Toast[]>([]);

	const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
		const id = Math.random().toString(36).substring(2, 9);
		const newToast = { ...toast, id };
		setToasts((prev) => [...prev, newToast]);

		// Auto-remove after duration
		const duration = toast.duration || 4000;
		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id));
		}, duration);
	}, []);

	const removeToast = React.useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	return (
		<ToastContext.Provider value={{ toasts, addToast, removeToast }}>
			{children}
		</ToastContext.Provider>
	);
}

export function useToast() {
	const context = React.useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
}

// Componente simples para renderizar mensagens inline
export function InlineToasts() {
	const { toasts, removeToast } = useToast();

	if (toasts.length === 0) return null;

	return (
		<div className="space-y-2 mt-4">
			{toasts.map((toast) => {
				const icons = {
					success: CheckCircle2,
					error: AlertCircle,
					warning: AlertTriangle,
					info: Info,
				};

				const Icon = icons[toast.type];

				const variants = {
					success: "bg-green-50 border-green-200 text-green-800",
					error: "bg-red-50 border-red-200 text-red-800",
					warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
					info: "bg-blue-50 border-blue-200 text-blue-800",
				};

				return (
					<div
						key={toast.id}
						className={cn(
							"flex items-center gap-2 p-3 rounded-md border text-sm",
							variants[toast.type]
						)}
					>
						<Icon className="h-4 w-4 flex-shrink-0" />
						<span className="flex-1">{toast.message}</span>
						<button
							onClick={() => removeToast(toast.id)}
							className="text-current hover:opacity-70 transition-opacity"
						>
							<X className="h-4 w-4" />
						</button>
					</div>
				);
			})}
		</div>
	);
}
