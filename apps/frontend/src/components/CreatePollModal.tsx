"use client";

import type React from "react";
import { useState } from "react";
import { useUser } from "../contexts/UserContext";
import { useToast } from "../contexts/ToastContext";
import axios from "axios";

interface CreatePollModalProps {
	onClose: () => void;
	onPollCreated: () => void;
}

export default function CreatePollModal({
	onClose,
	onPollCreated,
}: CreatePollModalProps) {
	const { fullName } = useUser();
	const { addToast } = useToast();
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [endTime, setEndTime] = useState("");
	const [options, setOptions] = useState(["", ""]);
	const [loading, setLoading] = useState(false);

	const addOption = () => {
		if (options.length < 5) {
			setOptions([...options, ""]);
		}
	};

	const removeOption = (index: number) => {
		if (options.length > 2) {
			setOptions(options.filter((_, i) => i !== index));
		}
	};

	const updateOption = (index: number, value: string) => {
		const newOptions = [...options];
		newOptions[index] = value;
		setOptions(newOptions);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const validOptions = options.filter((opt) => opt.trim());
		if (validOptions.length < 2) {
			addToast("Please provide at least 2 options", "error");
			return;
		}

		setLoading(true);
		try {
			await axios.post("http://localhost:8001/api/polls/create/", {
				title: title.trim(),
				description: description.trim(),
				creator_name: fullName,
				end_time: endTime,
				options: validOptions.map((text) => ({ text, vote_count: 0 })),
			});

			addToast("Poll created successfully!", "success");
			onPollCreated();
		} catch (error) {
			console.error("Error creating poll:", error);
			addToast("Failed to create poll. Please try again.", "error");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
				<div className="p-4 border-b border-gray-200">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-bold text-gray-800">Create New Poll</h2>
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600 transition-colors">
							<svg
								className="w-6 h-6"
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

				<div className="p-6">
					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Poll Title *
							</label>
							<input
								type="text"
								placeholder="What's your question?"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Description (Optional)
							</label>
							<textarea
								placeholder="Add more context to your poll..."
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								rows={3}
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								End Time *
							</label>
							<input
								type="datetime-local"
								value={endTime}
								onChange={(e) => setEndTime(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								required
							/>
						</div>

						<div>
							<div className="flex items-center justify-between mb-3">
								<label className="block text-sm font-medium text-gray-700">
									Options * (2-5 options)
								</label>
								<button
									type="button"
									onClick={addOption}
									disabled={options.length >= 5}
									className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed">
									+ Add Option
								</button>
							</div>

							<div className="space-y-3">
								{options.map((option, index) => (
									<div key={index} className="flex items-center gap-2">
										<input
											type="text"
											placeholder={`Option ${index + 1}`}
											value={option}
											onChange={(e) => updateOption(index, e.target.value)}
											className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											required
										/>
										{options.length > 2 && (
											<button
												type="button"
												onClick={() => removeOption(index)}
												className="text-red-600 hover:text-red-700 p-1">
												<svg
													className="w-4 h-4"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24">
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													/>
												</svg>
											</button>
										)}
									</div>
								))}
							</div>
						</div>

						<div className="flex gap-3 pt-4">
							<button
								type="button"
								onClick={onClose}
								className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
								Cancel
							</button>
							<button
								type="submit"
								disabled={loading}
								className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
								{loading ? "Creating..." : "Create Poll"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
