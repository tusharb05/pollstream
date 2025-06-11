"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface UserContextType {
	fullName: string;
	setFullName: (name: string) => void;
	logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
	const [fullName, setFullName] = useState<string>(() => {
		if (typeof window !== "undefined") {
			return localStorage.getItem("pollstream_user_name") || "";
		}
		return "";
	});

	const setFullNameAndSave = (name: string) => {
		setFullName(name);
		if (typeof window !== "undefined") {
			localStorage.setItem("pollstream_user_name", name);
		}
	};

	const logout = () => {
		setFullName("");
		if (typeof window !== "undefined") {
			localStorage.removeItem("pollstream_user_name");
		}
	};

	return (
		<UserContext.Provider
			value={{ fullName, setFullName: setFullNameAndSave, logout }}>
			{children}
		</UserContext.Provider>
	);
};

export const useUser = () => {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error("useUser must be used within a UserProvider");
	}
	return context;
};
