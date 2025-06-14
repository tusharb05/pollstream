"use client"

import { useEffect, useRef } from "react"

interface UseWebSocketOptions {
  onMessage?: (data: any) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
  enabled?: boolean
  reconnectInterval?: number
}

export const useWebSocket = (url: string, options: UseWebSocketOptions = {}) => {
  const {
		onMessage,
		onOpen,
		onClose,
		onError,
		enabled = true,
		reconnectInterval = 3000,
	} = options;

	const wsRef = useRef<WebSocket | null>(null);
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const hasConnectedRef = useRef(false);

	const connect = () => {
		// Prevent double connections (React StrictMode mounts twice)
		if (!enabled || hasConnectedRef.current) return;

		try {
			wsRef.current = new WebSocket(url);
			hasConnectedRef.current = true;

			wsRef.current.onopen = () => {
				console.log("WebSocket connected to", url);
				onOpen?.();
			};

			wsRef.current.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);
					onMessage?.(data);
				} catch (e) {
					console.error("Error parsing WebSocket message:", e);
				}
			};

			wsRef.current.onclose = () => {
				console.log("WebSocket disconnected from", url);
				onClose?.();
				wsRef.current = null;
				hasConnectedRef.current = false;

				if (enabled) {
					reconnectTimeoutRef.current = setTimeout(() => {
						console.log("Reconnecting WebSocket to", url);
						connect();
					}, reconnectInterval);
				}
			};

			wsRef.current.onerror = (err) => {
				console.error("WebSocket error on", url, err);
				onError?.(err);
			};
		} catch (e) {
			console.error("Failed to create WebSocket for", url, e);
		}
	};

	useEffect(() => {
		if (enabled) {
			connect();
		}

		return () => {
			// Cleanup on unmount or when URL/enabled change
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
			}
			if (wsRef.current) {
				wsRef.current.close();
				wsRef.current = null;
			}
			hasConnectedRef.current = false;
		};
	}, [url, enabled]);

	const sendMessage = (message: any) => {
		if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
			wsRef.current.send(JSON.stringify(message));
		}
	};

  return { sendMessage }
}
