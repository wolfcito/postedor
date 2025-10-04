"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { resolveAssetTag } from "@/lib/mock-service"
import { Loader2 } from "lucide-react"

interface PageProps {
  params: Promise<{ assetTag: string }>
}

export default function AssetTagPage({ params }: PageProps) {
  const router = useRouter()
  const [assetTag, setAssetTag] = useState<string>("")

  useEffect(() => {
    params.then((p) => setAssetTag(p.assetTag))
  }, [params])

  useEffect(() => {
    if (!assetTag) return

    const resolveTag = async () => {
      const startTime = performance.now()
      console.log("[v0:telemetry] Asset tag lookup started", { assetTag })

      try {
        const { tokenId } = await resolveAssetTag(assetTag)
        const duration = performance.now() - startTime

        console.log("[v0:telemetry] Asset tag resolved successfully", {
          assetTag,
          tokenId,
          duration: `${duration.toFixed(2)}ms`,
        })

        await new Promise((resolve) => setTimeout(resolve, 500))
        router.push(`/p/${tokenId}`)
      } catch (error) {
        const duration = performance.now() - startTime

        console.log("[v0:telemetry] Asset tag lookup failed", {
          assetTag,
          error: error instanceof Error ? error.message : "Unknown error",
          duration: `${duration.toFixed(2)}ms`,
        })

        router.push("/?error=not-found")
      }
    }

    resolveTag()
  }, [assetTag, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Resolviendo asset tag...</p>
      </div>
    </div>
  )
}
