import { type NextRequest, NextResponse } from "next/server"
import type { Poste } from "@/lib/types"

const CACHE_DURATION = 60 // seconds

function getBaseUrl() {
  const envUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)
  return envUrl ?? "http://localhost:3000"
}

async function getPostesData(): Promise<Poste[]> {
  const response = await fetch(new URL("/mocks/postes.json", getBaseUrl()), {
    next: { revalidate: CACHE_DURATION },
  })
  if (!response.ok) throw new Error("Failed to load postes data")
  return response.json()
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ tokenId: string }> }) {
  const startTime = Date.now()
  const { tokenId } = await params

  console.log("[v0:api] GET /api/poste/:tokenId", { tokenId })

  try {
    const data = await getPostesData()
    const poste = data.find((d) => d.tokenId === tokenId)

    if (!poste) {
      console.log("[v0:api] Poste not found", { tokenId, duration: Date.now() - startTime })
      return NextResponse.json(
        {
          error: "NOT_FOUND",
          message: "Poste no encontrado",
          tokenId,
        },
        { status: 404 },
      )
    }

    console.log("[v0:api] Poste found", { tokenId, duration: Date.now() - startTime })

    return NextResponse.json(poste, {
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate`,
      },
    })
  } catch (error) {
    console.error("[v0:api] Error fetching poste", { tokenId, error })
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "Error al cargar datos del poste",
      },
      { status: 500 },
    )
  }
}
