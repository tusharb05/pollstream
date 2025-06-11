"use client";

import { useState } from "react";
import { useUser } from "../contexts/UserContext";
import { useToast } from "../contexts/ToastContext";
import NameModal from "./NameModal";
import PollsList from "./PollsList";
import CreatePollModal from "./CreatePollModal";
import ToastContainer from "./ToastContainer";
import FloatingActionButton from "./FloatingActionButton";
import { useWebSocket } from "../hooks/useWebSocket";

export default function PollStreamApp() {
	const { fullName, logout } = useUser();
	const { addToast } = useToast();
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	// WebSocket connection
	useWebSocket("ws://localhost:8003/ws/global/", {
		onMessage: (data) => {
			if (data.type === "vote_notification") {
				addToast(
					`${data.voter_name} just voted for ${data.option_text} in "${data.poll_text}"`,
					"info"
				);
			}
		},
		enabled: !!fullName,
	});

	const handlePollCreated = () => {
		setShowCreateModal(false);
		setRefreshTrigger((prev) => prev + 1);
	};

	if (!fullName) {
		return <NameModal />;
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto px-4 py-8 max-w-4xl">
				<header className="text-center mb-8">
					<div className="flex items-center justify-between mb-4">
						<div></div> {/* Empty div for spacing */}
						<h1 className="text-3xl font-bold text-gray-800">📊 PollStream</h1>
						<button
							onClick={logout}
							className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
							Logout
						</button>
					</div>
					<p className="text-gray-600">
						Welcome back,{" "}
						<span className="font-medium text-blue-600">{fullName}</span>
					</p>
				</header>

				<PollsList key={refreshTrigger} />

				<FloatingActionButton onClick={() => setShowCreateModal(true)} />

				{showCreateModal && (
					<CreatePollModal
						onClose={() => setShowCreateModal(false)}
						onPollCreated={handlePollCreated}
					/>
				)}

				<ToastContainer />
			</div>
		</div>
	);
}
