import { type NextRequest, NextResponse } from "next/server"
import type { ReportKPIs, ReportFilters, Poste, PosteEvent } from "@/lib/types"

const MAINTENANCE_LABELS = ["Preventivo", "Correctivo", "Estético", "Vandalismo", "Emergencia"]

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  console.log("[v0] [Reports API] Fetching aggregated report data")

  try {
    const { searchParams } = new URL(request.url)
    const filters: ReportFilters = {
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      ubicacion: searchParams.get("ubicacion") || undefined,
      seguridadMinima: searchParams.has("seguridadMinima") ? Number(searchParams.get("seguridadMinima")) : undefined,
    }

    console.log("[v0] [Reports API] Filters:", filters)

    // Fetch all postes
    const postesRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/mocks/postes.json`)
    const allPostes: Poste[] = await postesRes.json()

    // Apply filters to postes
    let filteredPostes = allPostes

    if (filters.ubicacion) {
      filteredPostes = filteredPostes.filter((p) =>
        p.ubicacion.toLowerCase().includes(filters.ubicacion!.toLowerCase()),
      )
    }

    if (filters.seguridadMinima !== undefined) {
      filteredPostes = filteredPostes.filter((p) => p.seguridad >= filters.seguridadMinima!)
    }

    // Fetch all events for filtered postes
    const tokenIds = filteredPostes.map((p) => p.tokenId)
    const allEvents: PosteEvent[] = []

    for (const tokenId of tokenIds) {
      try {
        const eventsRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/mocks/events-${tokenId}.json`)
        const events: PosteEvent[] = await eventsRes.json()
        allEvents.push(...events)
      } catch {
        // No events for this pole
      }
    }

    // Apply date filters to events
    let filteredEvents = allEvents

    if (filters.startDate) {
      filteredEvents = filteredEvents.filter((e) => new Date(e.ts) >= new Date(filters.startDate!))
    }

    if (filters.endDate) {
      filteredEvents = filteredEvents.filter((e) => new Date(e.ts) <= new Date(filters.endDate!))
    }

    // Calculate KPIs
    const maintenanceEvents = filteredEvents.filter((e) => e.type === "MAINTENANCE")
    const readingEvents = filteredEvents.filter((e) => e.type === "READING")
    const replacementEvents = filteredEvents.filter((e) => e.type === "REPLACEMENT")

    // Top incidents (maintenance kinds)
    const incidentCounts = new Map<number, number>()
    maintenanceEvents.forEach((e) => {
      if (e.type === "MAINTENANCE") {
        const count = incidentCounts.get(e.maintenanceKind) || 0
        incidentCounts.set(e.maintenanceKind, count + 1)
      }
    })

    const topIncidents = Array.from(incidentCounts.entries())
      .map(([kind, count]) => ({
        kind,
        count,
        label: MAINTENANCE_LABELS[kind] || "Desconocido",
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Poles by location
    const locationCounts = new Map<string, number>()
    filteredPostes.forEach((p) => {
      const city = p.ubicacion.split(" - ")[0] || p.ubicacion
      const count = locationCounts.get(city) || 0
      locationCounts.set(city, count + 1)
    })

    const polesByLocation = Array.from(locationCounts.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)

    // Interventions by date (last 30 days)
    const dateCounts = new Map<string, number>()
    filteredEvents.forEach((e) => {
      const date = e.ts.split("T")[0]
      const count = dateCounts.get(date) || 0
      dateCounts.set(date, count + 1)
    })

    const interventionsByDate = Array.from(dateCounts.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Average security score
    const averageSeguridad =
      filteredPostes.length > 0 ? filteredPostes.reduce((sum, p) => sum + p.seguridad, 0) / filteredPostes.length : 0

    const kpis: ReportKPIs = {
      totalPoles: filteredPostes.length,
      totalInterventions: filteredEvents.length,
      maintenanceCount: maintenanceEvents.length,
      readingCount: readingEvents.length,
      replacementCount: replacementEvents.length,
      averageSeguridad: Math.round(averageSeguridad * 10) / 10,
      topIncidents,
      polesByLocation,
      interventionsByDate,
    }

    const duration = Date.now() - startTime
    console.log(`[v0] [Reports API] Generated KPIs in ${duration}ms`)

    return NextResponse.json(kpis, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    })
  } catch (error) {
    console.error("[v0] [Reports API] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate report",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
