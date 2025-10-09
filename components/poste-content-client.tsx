"use client"

import { PosteDataProvider } from "@/components/poste-data-provider"
import { PosteHeader } from "@/components/poste-header"
import { StatCard } from "@/components/stat-card"
import { TimelineWithRefresh } from "@/components/timeline-with-refresh"
import { Zap, TrendingUp, TrendingDown, Shield, Database, Wifi } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { TwitterShareButton } from "@/components/twitter-share-button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PosteRecordReading } from "@/components/poste-record-reading"
import { PosteRecordMaintenance } from "@/components/poste-record-maintenance"
import { PosteRecordReplacement } from "@/components/poste-record-replacement"
import type { Poste, PosteEvent, PosteWithSource } from "@/lib/types"

interface PosteContentClientProps {
  tokenId: string
  initialPoste: PosteWithSource
  fallbackPoste?: Poste
  initialEvents: PosteEvent[]
}

export function PosteContentClient({ tokenId, initialPoste, fallbackPoste, initialEvents }: PosteContentClientProps) {
  return (
    <PosteDataProvider tokenId={tokenId} initialPoste={initialPoste} fallbackPoste={fallbackPoste}>
      {({ poste, isFromContract, isLoading }) => (
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="space-y-8">
              {/* Data Source Indicator */}
              {isFromContract && (
                <Alert className="border-green-500/50 bg-green-500/10">
                  <Wifi className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-500">
                    Datos cargados desde el contrato en Polkadot Asset Hub
                  </AlertDescription>
                </Alert>
              )}

              {/* Header */}
              <div className="relative">
                {isLoading && (
                  <div className="absolute top-0 right-0">
                    <Badge variant="outline" className="animate-pulse">
                      Cargando del contrato...
                    </Badge>
                  </div>
                )}
                <PosteHeader
                  imageURI={poste.imageURI}
                  tokenId={poste.tokenId}
                  assetTag={poste.assetTag}
                  seguridad={poste.seguridad}
                  ubicacion={poste.ubicacion}
                  lastAttestationUID={poste.lastAttestationUID}
                />
                {!isFromContract && !isLoading && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Database className="h-4 w-4" />
                    Datos de base de datos local (conecta tu wallet para ver datos del contrato)
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <TwitterShareButton tokenId={poste.tokenId} assetTag={poste.assetTag} ubicacion={poste.ubicacion} />
              </div>

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

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 justify-end">
                <PosteRecordReading
                  tokenId={tokenId}
                  currentDelivered={poste.consumoEntregado}
                  currentRemaining={poste.consumoRestante}
                />
                <PosteRecordMaintenance tokenId={tokenId} />
                <PosteRecordReplacement tokenId={tokenId} />
                <Button asChild size="sm">
                  <Link href={`/ops/${tokenId}/new`}>Registrar Nueva Intervención</Link>
                </Button>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Historial de Operaciones</h2>
                  <p className="text-sm text-muted-foreground">
                    {initialEvents.length} {initialEvents.length === 1 ? "evento" : "eventos"}
                  </p>
                </div>
                <TimelineWithRefresh initialEvents={initialEvents} tokenId={tokenId} />
              </div>
            </div>
          </div>
        </div>
      )}
    </PosteDataProvider>
  )
}
