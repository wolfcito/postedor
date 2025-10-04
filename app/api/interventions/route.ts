import { type NextRequest, NextResponse } from "next/server"
import { generateMockAttestationUID, generateMockTxHash, generateMockActor } from "@/lib/mock-attestation"
import type { PosteEvent } from "@/lib/types"

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { tokenId, type, ...data } = body

    console.log("[v0] API: Creating intervention", { tokenId, type })

    // Validate required fields
    if (!tokenId || !type) {
      return NextResponse.json({ error: "Missing required fields: tokenId, type" }, { status: 400 })
    }

    // Generate mock attestation data
    const attestationUID = generateMockAttestationUID()
    const txHash = generateMockTxHash()
    const actor = generateMockActor()
    const ts = new Date().toISOString()
    const id = `e${Date.now()}`

    // Create the event based on type
    let event: PosteEvent

    switch (type) {
      case "READING":
        if (typeof data.deliveredKWh !== "number" || typeof data.remainingKWh !== "number") {
          return NextResponse.json({ error: "Invalid reading data" }, { status: 400 })
        }
        event = {
          id,
          tokenId,
          type: "READING",
          actor,
          attestationUID,
          txHash,
          ts,
          deliveredKWh: data.deliveredKWh,
          remainingKWh: data.remainingKWh,
        }
        break

      case "MAINTENANCE":
        if (typeof data.maintenanceKind !== "number" || data.maintenanceKind < 0 || data.maintenanceKind > 4) {
          return NextResponse.json({ error: "Invalid maintenance kind" }, { status: 400 })
        }
        event = {
          id,
          tokenId,
          type: "MAINTENANCE",
          actor,
          attestationUID,
          txHash,
          ts,
          maintenanceKind: data.maintenanceKind as 0 | 1 | 2 | 3 | 4,
          notes: data.notes,
        }
        break

      case "REPLACEMENT":
        if (!data.oldSerial || !data.newSerial) {
          return NextResponse.json({ error: "Missing serial numbers" }, { status: 400 })
        }
        event = {
          id,
          tokenId,
          type: "REPLACEMENT",
          actor,
          attestationUID,
          txHash,
          ts,
          oldSerial: data.oldSerial,
          newSerial: data.newSerial,
        }
        break

      default:
        return NextResponse.json({ error: "Invalid intervention type" }, { status: 400 })
    }

    // In a real app, this would save to a database
    // For now, we'll just return the created event
    console.log("[v0] API: Intervention created", event)

    const duration = Date.now() - startTime
    console.log("[v0] API: Intervention endpoint completed in", duration, "ms")

    return NextResponse.json(
      {
        success: true,
        event,
        attestationUID,
        txHash,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] API: Error creating intervention:", error)
    return NextResponse.json(
      {
        error: "Failed to create intervention",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
