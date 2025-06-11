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
  const { onMessage, onOpen, onClose, onError, enabled = true, reconnectInterval = 3000 } = options

  const ws = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = () => {
    if (!enabled) return

    try {
      ws.current = new WebSocket(url)

      ws.current.onopen = () => {
        console.log("WebSocket connected")
        onOpen?.()
      }

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          onMessage?.(data)
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      ws.current.onclose = () => {
        console.log("WebSocket disconnected")
        onClose?.()

        // Attempt to reconnect
        if (enabled) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("Attempting to reconnect...")
            connect()
          }, reconnectInterval)
        }
      }

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error)
        onError?.(error)
      }
    } catch (error) {
      console.error("Error creating WebSocket connection:", error)
    }
  }

  useEffect(() => {
    if (enabled) {
      connect()
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [url, enabled])

  const sendMessage = (message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message))
    }
  }

  return { sendMessage }
}
