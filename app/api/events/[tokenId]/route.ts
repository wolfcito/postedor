import { type NextRequest, NextResponse } from "next/server"
import type { PosteEvent } from "@/lib/types"

const CACHE_DURATION = 60 // seconds

function getBaseUrl() {
  const envUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)
  return envUrl ?? "http://localhost:3000"
}

async function getEventsData(tokenId: string): Promise<PosteEvent[]> {
  try {
    const response = await fetch(new URL(`/mocks/events-${tokenId}.json`, getBaseUrl()), {
      next: { revalidate: CACHE_DURATION },
    })
    if (!response.ok) return []
    return response.json()
  } catch {
    return []
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ tokenId: string }> }) {
  const startTime = Date.now()
  const { tokenId } = await params

  console.log("[v0:api] GET /api/events/:tokenId", { tokenId })

  try {
    const data = await getEventsData(tokenId)
    const sortedEvents = data.sort((a, b) => +new Date(b.ts) - +new Date(a.ts))

    console.log("[v0:api] Events loaded", { tokenId, count: sortedEvents.length, duration: Date.now() - startTime })

    return NextResponse.json(sortedEvents, {
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
