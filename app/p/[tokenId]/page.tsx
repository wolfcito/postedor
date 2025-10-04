import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getPosteByTokenId, getEventsByTokenId } from "@/lib/mock-service"
import { PosteHeader } from "@/components/poste-header"
import { StatCard } from "@/components/stat-card"
import { EventsTimeline } from "@/components/events-timeline"
import { Zap, TrendingUp, TrendingDown, Shield } from "lucide-react"
import { Card } from "@/components/ui/card"

interface PageProps {
  params: Promise<{ tokenId: string }>
}

async function PosteContent({ tokenId }: { tokenId: string }) {
  try {
    const [poste, events] = await Promise.all([getPosteByTokenId(tokenId), getEventsByTokenId(tokenId)])

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
              <EventsTimeline events={events} />
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
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

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PosteContent tokenId={tokenId} />
    </Suspense>
  )
}
