"use client";

import type React from "react";
import { useState } from "react";
import { useUser } from "../contexts/UserContext";

export default function NameModal() {
	const [name, setName] = useState("");
	const { setFullName, fullName } = useUser();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (name.trim()) {
			setFullName(name.trim());
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="w-full max-w-md bg-white rounded-lg shadow-xl">
				<div className="p-6 text-center border-b border-gray-200">
					<h2 className="text-2xl font-bold text-gray-800">
						Welcome to PollStream
					</h2>
					<p className="text-gray-600 mt-2">
						Please enter your full name to continue
					</p>
				</div>
				<div className="p-6">
					<form onSubmit={handleSubmit} className="space-y-4">
						<input
							type="text"
							placeholder="Enter your full name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							required
						/>
						<button
							type="submit"
							className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={!name.trim()}>
							{fullName ? "Update Name" : "Continue to Polls"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
