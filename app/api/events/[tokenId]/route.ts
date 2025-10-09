import { type NextRequest, NextResponse } from "next/server"
import { getEventsByTokenId } from "@/lib/mock-service"

const CACHE_DURATION = 60 // seconds

export async function GET(request: NextRequest, { params }: { params: Promise<{ tokenId: string }> }) {
  const startTime = Date.now()
  const { tokenId } = await params

  console.log("[v0:api] GET /api/events/:tokenId", { tokenId })

  try {
    const events = await getEventsByTokenId(tokenId)

    console.log("[v0:api] Events loaded", { tokenId, count: events.length, duration: Date.now() - startTime })

    return NextResponse.json(events, {
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate`,
      },
    })
  } catch (error) {
    console.error("[v0:api] Error fetching events", { tokenId, error })
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "Error al cargar eventos",
      },
      { status: 500 },
    )
  }
}
