"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface Toast {
	id: string;
	message: string;
	type: "info" | "success" | "error";
}

interface ToastContextType {
	toasts: Toast[];
	addToast: (message: string, type?: "info" | "success" | "error") => void;
	removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const addToast = (
		message: string,
		type: "info" | "success" | "error" = "info"
	) => {
		const id = Math.random().toString(36).substr(2, 9);
		const newToast = { id, message, type };
		setToasts((prev) => [...prev, newToast]);

		setTimeout(() => {
			removeToast(id);
		}, 3000);
	};

	const removeToast = (id: string) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id));
	};

	return (
		<ToastContext.Provider value={{ toasts, addToast, removeToast }}>
			{children}
		</ToastContext.Provider>
	);
};

export const useToast = () => {
	const context = useContext(ToastContext);
	if (context === undefined) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
};
