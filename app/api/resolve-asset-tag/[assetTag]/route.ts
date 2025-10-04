import { type NextRequest, NextResponse } from "next/server"
import { hashAssetTag } from "@/lib/hash-utils"
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ assetTag: string }> }) {
  const startTime = Date.now()
  const { assetTag } = await params

  console.log("[v0:api] GET /api/resolve-asset-tag/:assetTag", { assetTag })

  try {
    // Hash the asset tag for on-chain lookup simulation
    const hash = hashAssetTag(assetTag)
    console.log("[v0:api] Asset tag hashed", { assetTag, hash })

    // In mock mode, we do direct lookup by assetTag
    const data = await getPostesData()
    const poste = data.find((d) => d.assetTag === assetTag)

    if (!poste) {
      console.log("[v0:api] Asset tag not found", { assetTag, duration: Date.now() - startTime })
      return NextResponse.json(
        {
          error: "NOT_FOUND",
          message: "AssetTag no encontrado",
          assetTag,
          hash,
        },
        { status: 404 },
      )
    }

    console.log("[v0:api] Asset tag resolved", {
      assetTag,
      tokenId: poste.tokenId,
      duration: Date.now() - startTime,
    })

    return NextResponse.json(
      { tokenId: poste.tokenId },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate`,
        },
      },
    )
  } catch (error) {
    console.error("[v0:api] Error resolving asset tag", { assetTag, error })
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: "Error al resolver asset tag",
      },
      { status: 500 },
    )
  }
}
