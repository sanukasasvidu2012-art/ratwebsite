import { useEffect, useState } from 'react'

export function useLiveStatus() {
  const [connected, setConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<string | null>(null)

  useEffect(() => {
    const wsBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '')
    const url = wsBase.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:') + '/ws/status'
    let socket: WebSocket | undefined
    let retry: number | undefined
    let stopped = false
    const connect = () => {
      if (stopped) return
      try {
        socket = new WebSocket(url)
        socket.onopen = () => setConnected(true)
        socket.onmessage = (event) => setLastMessage(String(event.data))
        socket.onclose = () => {
          setConnected(false)
          if (!stopped) retry = window.setTimeout(connect, 5000)
        }
        socket.onerror = () => socket?.close()
      } catch {
        setConnected(false)
      }
    }
    // Demo mode is a local UI preview; no websocket server is expected.
    if (String(import.meta.env.VITE_DEMO_MODE ?? 'true').toLowerCase() !== 'true') connect()
    return () => { stopped = true; if (retry) window.clearTimeout(retry); socket?.close() }
  }, [])
  return { connected, lastMessage }
}
