"use client"

import { useState, useEffect } from "react"
import { EventsTimeline } from "./events-timeline"
import type { PosteEvent } from "@/lib/types"
import { RefreshCw } from "lucide-react"
import { Button } from "./ui/button"

interface TimelineWithRefreshProps {
  initialEvents: PosteEvent[]
  tokenId: string
}

export function TimelineWithRefresh({ initialEvents, tokenId }: TimelineWithRefreshProps) {
  const [events, setEvents] = useState<PosteEvent[]>(initialEvents)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    console.log("[v0] Timeline refresh listener started for pole", tokenId)

    const checkForUpdates = async () => {
      try {
        setIsRefreshing(true)
        console.log("[v0] Checking for timeline updates...")

        // Mock fetch - in production this would call an API endpoint
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ""
        const response = await fetch(`${baseUrl}/mocks/events-${tokenId}.json`)

        if (response.ok) {
          const newEvents = await response.json()
          if (JSON.stringify(newEvents) !== JSON.stringify(events)) {
            console.log("[v0] New events detected, updating timeline")
            setEvents(newEvents)
            setLastUpdate(new Date())
          }
        }
      } catch (error) {
        console.log("[v0] Timeline refresh error:", error)
      } finally {
        setIsRefreshing(false)
      }
    }

    // Check for updates every 30 seconds
    const interval = setInterval(checkForUpdates, 30000)

    return () => {
      console.log("[v0] Timeline refresh listener stopped")
      clearInterval(interval)
    }
  }, [tokenId, events])

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    console.log("[v0] Manual timeline refresh triggered")

    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ""
      const response = await fetch(`${baseUrl}/mocks/events-${tokenId}.json`)

      if (response.ok) {
        const newEvents = await response.json()
        setEvents(newEvents)
        setLastUpdate(new Date())
        console.log("[v0] Timeline refreshed successfully")
      }
    } catch (error) {
      console.log("[v0] Manual refresh error:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Historial de Operaciones</h2>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {events.length} {events.length === 1 ? "evento" : "eventos"}
          </p>
          <Button variant="outline" size="sm" onClick={handleManualRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Última actualización: {lastUpdate.toLocaleTimeString("es-CO")}</p>
      <EventsTimeline events={events} />
    </div>
  )
}
