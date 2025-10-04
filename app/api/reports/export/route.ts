import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import type { Poste, PosteEvent, ExportPoleData, ReportFilters } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  console.log("[v0] [API] Export request received")

  try {
    const searchParams = request.nextUrl.searchParams
    const filters: ReportFilters = {
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      ubicacion: searchParams.get("ubicacion") || undefined,
      seguridadMinima: searchParams.has("seguridadMinima") ? Number(searchParams.get("seguridadMinima")) : undefined,
    }

    console.log("[v0] [API] Export filters:", filters)

    // Read mock data
    const postesPath = path.join(process.cwd(), "public/mocks/postes.json")
    const postesData = await fs.readFile(postesPath, "utf-8")
    let poles: Poste[] = JSON.parse(postesData)

    // Read all events
    const events1Path = path.join(process.cwd(), "public/mocks/events-1.json")
    const events2Path = path.join(process.cwd(), "public/mocks/events-2.json")
    const events1Data = await fs.readFile(events1Path, "utf-8")
    const events2Data = await fs.readFile(events2Path, "utf-8")
    const allEvents: PosteEvent[] = [...JSON.parse(events1Data), ...JSON.parse(events2Data)]

    // Apply filters
    if (filters.ubicacion) {
      poles = poles.filter((p) => p.ubicacion === filters.ubicacion)
    }

    if (filters.seguridadMinima !== undefined) {
      poles = poles.filter((p) => p.seguridad >= filters.seguridadMinima!)
    }

    // Calculate intervention counts for each pole
    const exportData: ExportPoleData[] = poles.map((pole) => {
      let poleEvents = allEvents.filter((e) => e.tokenId === pole.tokenId)

      // Apply date filters to events
      if (filters.startDate) {
        poleEvents = poleEvents.filter((e) => e.ts >= filters.startDate!)
      }
      if (filters.endDate) {
        poleEvents = poleEvents.filter((e) => e.ts <= filters.endDate!)
      }

      return {
        tokenId: pole.tokenId,
        assetTag: pole.assetTag || "N/A",
        ubicacion: pole.ubicacion,
        capacidadKW: pole.capacidadKW,
        consumoEntregado: pole.consumoEntregado,
        consumoRestante: pole.consumoRestante,
        seguridad: pole.seguridad,
        interventionCount: poleEvents.length,
        lastAttestationUID: pole.lastAttestationUID || "N/A",
        updatedAt: pole.updatedAt,
      }
    })

    const duration = Date.now() - startTime
    console.log(`[v0] [API] Export data prepared in ${duration}ms - ${exportData.length} records`)

    return NextResponse.json(exportData)
  } catch (error) {
    console.error("[v0] [API] Export error:", error)
    return NextResponse.json({ error: "Failed to generate export data" }, { status: 500 })
  }
}
