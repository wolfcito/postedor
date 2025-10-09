import { redirect } from "next/navigation"
import { resolveAssetTag } from "@/lib/mock-service"

interface PageProps {
  params: Promise<{ assetTag: string }>
}

export default async function AssetTagPage({ params }: PageProps) {
  const startTime = Date.now()
  const { assetTag } = await params
  const normalized = assetTag.trim()

  console.log("[v0:telemetry] Asset tag lookup started", { assetTag: normalized })

  try {
    const { tokenId } = await resolveAssetTag(normalized)
    const duration = Date.now() - startTime

    console.log("[v0:telemetry] Asset tag resolved successfully", {
      assetTag: normalized,
      tokenId,
      duration: `${duration}ms`,
    })

    redirect(`/p/${normalized}`)
  } catch (error) {
    const duration = Date.now() - startTime

    console.log("[v0:telemetry] Asset tag lookup failed", {
      assetTag: normalized,
      error: error instanceof Error ? error.message : "Unknown error",
      duration: `${duration}ms`,
    })

    redirect("/?error=not-found")
  }
}
