import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getPosteByTokenId, getEventsByTokenId } from "@/lib/mock-service"
import { PosteHeader } from "@/components/poste-header"
import { StatCard } from "@/components/stat-card"
import { TimelineWithRefresh } from "@/components/timeline-with-refresh"
import { Zap, TrendingUp, TrendingDown, Shield } from "lucide-react"
import { Card } from "@/components/ui/card"

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

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="space-y-8">
            {/* Header */}
            <PosteHeader
              imageURI={poste.imageURI}
              tokenId={poste.tokenId}
              assetTag={poste.assetTag}
              seguridad={poste.seguridad}
              ubicacion={poste.ubicacion}
              lastAttestationUID={poste.lastAttestationUID}
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Capacidad" value={poste.capacidadKW} unit="kW" icon={Zap} />
              <StatCard
                label="Consumo Entregado"
                value={poste.consumoEntregado}
                unit="kWh"
                icon={TrendingUp}
                trend="up"
              />
              <StatCard
                label="Consumo Restante"
                value={poste.consumoRestante}
                unit="kWh"
                icon={TrendingDown}
                trend="down"
              />
              <StatCard
                label="Índice de Seguridad"
                value={`${poste.seguridad > 0 ? "+" : ""}${poste.seguridad}`}
                icon={Shield}
                trend={poste.seguridad >= 5 ? "up" : poste.seguridad >= 0 ? "neutral" : "down"}
              />
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Historial de Operaciones</h2>
                <p className="text-sm text-muted-foreground">
                  {events.length} {events.length === 1 ? "evento" : "eventos"}
                </p>
              </div>
              <TimelineWithRefresh initialEvents={events} tokenId={tokenId} />
            </div>
          </div>
        </div>
      </div>
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
