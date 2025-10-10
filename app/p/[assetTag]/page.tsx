import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getPosteByTokenId, getEventsByTokenId, resolveAssetTag } from "@/lib/mock-service"
import { Card } from "@/components/ui/card"
import { PosteContentClient } from "@/components/poste-content-client"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ assetTag: string }>
}

async function PosteContent({ assetTag }: { assetTag: string }) {
  const fetchStart = Date.now()
  console.log("[v0] Fetching data for pole", { assetTag })

  try {
    const { tokenId } = await resolveAssetTag(assetTag)

    const metadata = /^\d+$/.test(assetTag) ? undefined : { assetTag }

    const [poste, events] = await Promise.all([
      getPosteByTokenId(tokenId, metadata),
      getEventsByTokenId(tokenId, metadata),
    ])

    const fetchDuration = Date.now() - fetchStart
    console.log("[v0] Data fetched in", fetchDuration, "ms")
    console.log("[v0] Timeline loaded with", events.length, "events")
    console.log("[v0] Poste source", poste.source)

    return (
      <PosteContentClient
        tokenId={tokenId}
        initialPoste={poste}
        fallbackPoste={poste.fallback}
        initialEvents={events}
      />
    )
  } catch (error) {
    console.log("[v0] Error fetching pole data:", error)
    notFound()
  }
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="page-shell py-8">
        <div className="space-y-8">
          <Card className="h-80 animate-pulse bg-muted" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="h-32 animate-pulse bg-muted" />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="h-48 animate-pulse bg-muted" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function PostePage({ params }: PageProps) {
  const { assetTag } = await params

  console.log("[v0] Rendering pole page for assetTag:", assetTag)

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PosteContent assetTag={assetTag} />
    </Suspense>
  )
}
