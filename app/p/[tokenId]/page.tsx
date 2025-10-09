import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getPosteByTokenId, getEventsByTokenId } from "@/lib/mock-service"
import { PosteHeader } from "@/components/poste-header"
import { StatCard } from "@/components/stat-card"
import { TimelineWithRefresh } from "@/components/timeline-with-refresh"
import { Zap, TrendingUp, TrendingDown, Shield } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { TwitterShareButton } from "@/components/twitter-share-button"
import { PosteContentClient } from "@/components/poste-content-client"

export const revalidate = 60

export async function generateStaticParams() {
  return [{ tokenId: "1" }, { tokenId: "2" }]
}

interface PageProps {
  params: Promise<{ tokenId: string }>
}

async function PosteContent({ tokenId }: { tokenId: string }) {
  const fetchStart = Date.now()
  console.log("[v0] Fetching data for pole", tokenId)

  try {
    const [poste, events] = await Promise.all([getPosteByTokenId(tokenId), getEventsByTokenId(tokenId)])

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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
  const { tokenId } = await params

  console.log("[v0] Rendering pole page for tokenId:", tokenId)

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PosteContent tokenId={tokenId} />
    </Suspense>
  )
}
