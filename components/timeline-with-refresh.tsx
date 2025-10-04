"use client"

import { useState, useEffect } from "react"
import { EventsTimeline } from "./events-timeline"
import type { PosteEvent } from "@/lib/types"
import { RefreshCw } from "lucide-react"
import { Button } from "./ui/button"
import { eventStream } from "@/lib/event-stream"
import { useToast } from "@/hooks/use-toast"

interface TimelineWithRefreshProps {
  initialEvents: PosteEvent[]
  tokenId: string
}

export function TimelineWithRefresh({ initialEvents, tokenId }: TimelineWithRefreshProps) {
  const [events, setEvents] = useState<PosteEvent[]>(initialEvents)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [optimisticEvents, setOptimisticEvents] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  useEffect(() => {
    console.log("[v0] Timeline: Setting up event stream listener for pole", tokenId)

    const unsubscribe = eventStream.subscribe(tokenId, (eventData) => {
      const updateStart = Date.now()
      console.log("[v0] Timeline: Received event from stream", eventData)

      if (eventData.type === "optimistic") {
        // Add optimistic event immediately
        console.log("[v0] Timeline: Adding optimistic event", eventData.event.id)
        setEvents((prev) => [eventData.event, ...prev])
        setOptimisticEvents((prev) => new Set(prev).add(eventData.event.id))
        setLastUpdate(new Date())

        // Track telemetry
        if (eventData.submissionStart) {
          const latency = Date.now() - eventData.submissionStart
          console.log("[v0] Telemetry: Optimistic update latency:", latency, "ms")
        }
      } else if (eventData.type === "confirmed") {
        // Replace optimistic event with confirmed one
        console.log("[v0] Timeline: Confirming event", eventData.event.id)
        setEvents((prev) => {
          // Remove optimistic version and add confirmed version
          const filtered = prev.filter((e) => e.id !== eventData.event.id)
          return [eventData.event, ...filtered]
        })
        setOptimisticEvents((prev) => {
          const next = new Set(prev)
          next.delete(eventData.event.id)
          return next
        })
        setLastUpdate(new Date())

        // Track telemetry
        if (eventData.submissionStart) {
          const latency = Date.now() - eventData.submissionStart
          console.log("[v0] Telemetry: Submission to timeline update latency:", latency, "ms")
        }

        const updateDuration = Date.now() - updateStart
        console.log("[v0] Timeline: Event confirmed in", updateDuration, "ms")
      } else if (eventData.type === "rollback") {
        // Remove failed optimistic event
        console.log("[v0] Timeline: Rolling back event", eventData.eventId)
        setEvents((prev) => prev.filter((e) => e.id !== eventData.eventId))
        setOptimisticEvents((prev) => {
          const next = new Set(prev)
          next.delete(eventData.eventId)
          return next
        })
        setLastUpdate(new Date())

        toast({
          title: "Error al registrar evento",
          description: eventData.error || "No se pudo guardar el evento. Intente nuevamente.",
          variant: "destructive",
        })
      }
    })

    return () => {
      console.log("[v0] Timeline: Cleaning up event stream listener")
      unsubscribe()
    }
  }, [tokenId, toast])

  useEffect(() => {
    console.log("[v0] Timeline: Starting polling fallback for pole", tokenId)

    const checkForUpdates = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ""
        const response = await fetch(`${baseUrl}/api/events/${tokenId}`, {
          cache: "no-store",
        })

        if (response.ok) {
          const newEvents = await response.json()
          // Only update if we have different events (excluding optimistic ones)
          const serverEventIds = new Set(newEvents.map((e: PosteEvent) => e.id))
          const currentEventIds = new Set(events.filter((e) => !optimisticEvents.has(e.id)).map((e) => e.id))

          if (JSON.stringify([...serverEventIds]) !== JSON.stringify([...currentEventIds])) {
            console.log("[v0] Timeline: Polling detected new events, syncing...")
            // Merge server events with optimistic events
            const optimisticEventsList = events.filter((e) => optimisticEvents.has(e.id))
            setEvents([...optimisticEventsList, ...newEvents])
            setLastUpdate(new Date())
          }
        }
      } catch (error) {
        console.log("[v0] Timeline: Polling error:", error)
      }
    }

    // Poll every 30 seconds as fallback
    const interval = setInterval(checkForUpdates, 30000)

    return () => {
      console.log("[v0] Timeline: Stopping polling fallback")
      clearInterval(interval)
    }
  }, [tokenId, events, optimisticEvents])

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    console.log("[v0] Timeline: Manual refresh triggered")

    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ""
      const response = await fetch(`${baseUrl}/api/events/${tokenId}`, {
        cache: "no-store",
      })

      if (response.ok) {
        const newEvents = await response.json()
        // Keep optimistic events and merge with server events
        const optimisticEventsList = events.filter((e) => optimisticEvents.has(e.id))
        setEvents([...optimisticEventsList, ...newEvents])
        setLastUpdate(new Date())
        console.log("[v0] Timeline: Manual refresh completed")

        toast({
          title: "Timeline actualizado",
          description: `${newEvents.length} eventos cargados`,
        })
      }
    } catch (error) {
      console.log("[v0] Timeline: Manual refresh error:", error)
      toast({
        title: "Error al actualizar",
        description: "No se pudo cargar los eventos. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {events.length} {events.length === 1 ? "evento" : "eventos"}
          </p>
          {optimisticEvents.size > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-warning">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>{optimisticEvents.size} pendiente(s)</span>
            </div>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleManualRefresh} disabled={isRefreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Última actualización: {lastUpdate.toLocaleTimeString("es-CO")}</p>
      <EventsTimeline events={events} optimisticEventIds={optimisticEvents} />
    </div>
  )
}
