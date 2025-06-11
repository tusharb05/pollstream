"use client";

import { UserProvider } from "./contexts/UserContext";
import { ToastProvider } from "./contexts/ToastContext";
import PollStreamApp from "./components/PollStreamApp";

export default function Home() {
	return (
		<UserProvider>
			<ToastProvider>
				<PollStreamApp />
			</ToastProvider>
		</UserProvider>
	);
}
