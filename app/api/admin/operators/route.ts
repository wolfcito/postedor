import { type NextRequest, NextResponse } from "next/server"
import type { Operator, OperatorActivity } from "@/lib/types"

const OPERATORS_URL = "/mocks/operators.json"
const ACTIVITY_URL = "/mocks/operator-activity.json"

// GET - List all operators
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const response = await fetch(`${baseUrl}${OPERATORS_URL}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("[v0] Failed to fetch operators:", response.statusText)
      return NextResponse.json({ error: "Failed to load operators" }, { status: 500 })
    }

    const operators: Operator[] = await response.json()
    const duration = Date.now() - startTime

    console.log(`[v0] [M2-S3] GET /api/admin/operators - ${operators.length} operators - ${duration}ms`)

    return NextResponse.json(operators, {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching operators:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Add new operator
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { address, name, email, role } = body

    // Validation
    if (!address || !name || !email || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate new operator
    const newOperator: Operator = {
      id: `op-${Date.now()}`,
      address,
      name,
      email,
      role,
      status: "active",
      addedAt: new Date().toISOString(),
      addedBy: "Admin Principal", // Mock admin
    }

    // Log activity
    const activity: OperatorActivity = {
      id: `act-${Date.now()}`,
      action: "added",
      operatorId: newOperator.id,
      operatorName: newOperator.name,
      actor: "Admin Principal",
      timestamp: new Date().toISOString(),
      details: `Agregado como ${role}`,
    }

    const duration = Date.now() - startTime
    console.log(`[v0] [M2-S3] POST /api/admin/operators - Added ${name} (${role}) - ${duration}ms`)
    console.log(`[v0] [AUDIT] Operator added:`, { operator: newOperator, activity })

    return NextResponse.json({ operator: newOperator, activity }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error adding operator:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Remove operator
export async function DELETE(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { searchParams } = new URL(request.url)
    const operatorId = searchParams.get("id")

    if (!operatorId) {
      return NextResponse.json({ error: "Operator ID required" }, { status: 400 })
    }

    // Log activity
    const activity: OperatorActivity = {
      id: `act-${Date.now()}`,
      action: "removed",
      operatorId,
      operatorName: "Operator", // Would fetch from data in real implementation
      actor: "Admin Principal",
      timestamp: new Date().toISOString(),
      details: "Removido del sistema",
    }

    const duration = Date.now() - startTime
    console.log(`[v0] [M2-S3] DELETE /api/admin/operators - Removed ${operatorId} - ${duration}ms`)
    console.log(`[v0] [AUDIT] Operator removed:`, { operatorId, activity })

    return NextResponse.json({ success: true, activity })
  } catch (error) {
    console.error("[v0] Error removing operator:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH - Update operator status
export async function PATCH(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { operatorId, status } = body

    if (!operatorId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Log activity
    const activity: OperatorActivity = {
      id: `act-${Date.now()}`,
      action: status === "active" ? "activated" : "deactivated",
      operatorId,
      operatorName: "Operator", // Would fetch from data in real implementation
      actor: "Admin Principal",
      timestamp: new Date().toISOString(),
      details: status === "active" ? "Reactivado" : "Desactivado",
    }

    const duration = Date.now() - startTime
    console.log(`[v0] [M2-S3] PATCH /api/admin/operators - Updated ${operatorId} to ${status} - ${duration}ms`)
    console.log(`[v0] [AUDIT] Operator status updated:`, { operatorId, status, activity })

    return NextResponse.json({ success: true, activity })
  } catch (error) {
    console.error("[v0] Error updating operator:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
