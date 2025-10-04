"use client"

import { useEffect, useState } from "react"
import { getMockWebSocket } from "@/lib/mock-websocket"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"

export function ConnectionStatus() {
  const [status, setStatus] = useState<"connected" | "disconnected" | "reconnecting">("disconnected")

  useEffect(() => {
    const ws = getMockWebSocket()
    setStatus(ws.getStatus())

    const unsubscribe = ws.onStatusChange((newStatus) => {
      setStatus(newStatus)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  if (status === "connected") {
    return (
      <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
        <Wifi className="w-3 h-3" />
        <span>Conectado</span>
      </div>
    )
  }

  if (status === "reconnecting") {
    return (
      <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
        <RefreshCw className="w-3 h-3 animate-spin" />
        <span>Reconectando...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
      <WifiOff className="w-3 h-3" />
      <span>Desconectado</span>
    </div>
  )
}
