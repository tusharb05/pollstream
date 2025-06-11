"use client";

import { useToast } from "../contexts/ToastContext";

export default function ToastContainer() {
	const { toasts, removeToast } = useToast();

	return (
		<div className="fixed bottom-6 left-6 space-y-2 z-50 max-w-sm">
			{toasts.map((toast, index) => (
				<div
					key={toast.id}
					className={`transform transition-all duration-300 ease-in-out ${
						index === toasts.length - 1
							? "animate-in slide-in-from-bottom-2"
							: ""
					}`}
					style={{
						transform: `translateY(-${index * 4}px)`,
					}}>
					<div
						className={`
            p-4 rounded-lg shadow-lg border-l-4 bg-white max-w-sm
            ${
							toast.type === "success"
								? "border-green-500"
								: toast.type === "error"
									? "border-red-500"
									: "border-blue-500"
						}
          `}>
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<p className="text-sm text-gray-800 font-medium">
									{toast.message}
								</p>
							</div>
							<button
								onClick={() => removeToast(toast.id)}
								className="ml-2 text-gray-400 hover:text-gray-600 transition-colors">
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
