import { redirect } from "next/navigation"
import { resolveAssetTag } from "@/lib/mock-service"

interface PageProps {
  params: Promise<{ assetTag: string }>
}

export default async function AssetTagPage({ params }: PageProps) {
  const startTime = Date.now()
  const { assetTag } = await params

  console.log("[v0:telemetry] Asset tag lookup started", { assetTag })

  try {
    const { tokenId } = await resolveAssetTag(assetTag)
    const duration = Date.now() - startTime

    console.log("[v0:telemetry] Asset tag resolved successfully", {
      assetTag,
      tokenId,
      duration: `${duration}ms`,
    })

    redirect(`/p/${tokenId}`)
  } catch (error) {
    const duration = Date.now() - startTime

    console.log("[v0:telemetry] Asset tag lookup failed", {
      assetTag,
      error: error instanceof Error ? error.message : "Unknown error",
      duration: `${duration}ms`,
    })

    redirect("/?error=not-found")
  }
}
