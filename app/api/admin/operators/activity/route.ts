import { type NextRequest, NextResponse } from "next/server"
import type { OperatorActivity } from "@/lib/types"

const ACTIVITY_URL = "/mocks/operator-activity.json"

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const response = await fetch(`${baseUrl}${ACTIVITY_URL}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("[v0] Failed to fetch operator activity:", response.statusText)
      return NextResponse.json({ error: "Failed to load activity" }, { status: 500 })
    }

    const activity: OperatorActivity[] = await response.json()
    const duration = Date.now() - startTime

    console.log(`[v0] [M2-S3] GET /api/admin/operators/activity - ${activity.length} activities - ${duration}ms`)

    return NextResponse.json(activity, {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching operator activity:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
