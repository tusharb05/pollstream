"use client";

import { useEffect, useRef } from "react";

interface UseWebSocketOptions {
	onMessage?: (data: any) => void;
	onOpen?: () => void;
	onClose?: () => void;
	onError?: (error: Event) => void;
	enabled?: boolean;
	reconnectInterval?: number;
}

export const useWebSocket = (
	url: string,
	options: UseWebSocketOptions = {}
) => {
	const {
		onMessage,
		onOpen,
		onClose,
		onError,
		enabled = true,
		reconnectInterval = 3000,
	} = options;

	// Use a ref to hold the WebSocket instance
	const wsRef = useRef<WebSocket | null>(null);
	// Use a ref to hold a timeout ID for reconnection attempts
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Use a ref to store the latest callbacks to avoid stale closures
	const savedCallbacks = useRef(options);
	useEffect(() => {
		savedCallbacks.current = options;
	}, [options]);

	useEffect(() => {
		if (!enabled) {
			return; // Do nothing if the connection is disabled
		}

		let isMounted = true; // Flag to check if the component is still mounted

		const connect = () => {
			if (wsRef.current) {
				// If a connection already exists, do nothing.
				return;
			}

			console.log("Attempting to connect WebSocket to", url);
			const ws = new WebSocket(url);
			wsRef.current = ws;

			ws.onopen = () => {
				console.log("WebSocket connected to", url);
				savedCallbacks.current.onOpen?.();
			};

			ws.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);
					savedCallbacks.current.onMessage?.(data);
				} catch (e) {
					console.error("Error parsing WebSocket message:", e);
				}
			};

			ws.onerror = (err) => {
				console.error("WebSocket error on", url, err);
				savedCallbacks.current.onError?.(err);
			};

			ws.onclose = () => {
				console.log("WebSocket disconnected from", url);
				savedCallbacks.current.onClose?.();

				// Clean up the ref
				wsRef.current = null;

				// Only attempt to reconnect if the component is still enabled and mounted
				if (enabled && isMounted) {
					console.log("Scheduling reconnect for WebSocket to", url);
					reconnectTimeoutRef.current = setTimeout(connect, reconnectInterval);
				}
			};
		};

		connect();

		// The cleanup function is the key to fixing the issue
		return () => {
			isMounted = false; // Mark the component as unmounted

			// Clear any pending reconnection timeout to prevent orphaned loops
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
			}

			// If the WebSocket connection exists, close it cleanly
			if (wsRef.current) {
				console.log(
					"Closing WebSocket connection due to component unmount/re-render"
				);
				// We set onclose to null to prevent the reconnection logic from firing on a manual close
				wsRef.current.onclose = null;
				wsRef.current.close();
				wsRef.current = null;
			}
		};

		// The dependency array ensures this effect re-runs only if the url or enabled status changes.
	}, [url, enabled, reconnectInterval]);

	// The sendMessage function is not used in your example, but it's good practice to keep it.
	const sendMessage = (message: any) => {
		if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
			wsRef.current.send(JSON.stringify(message));
		}
	};

	return { sendMessage };
};
