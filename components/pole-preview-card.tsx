import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Zap, Shield } from "lucide-react"
import Image from "next/image"

interface PolePreviewCardProps {
  assetTag: string
  ubicacion: string
  capacidadKW: number
  seguridad: number
  imageURI: string
  consumoEntregado: number
  consumoRestante: number
}

export function PolePreviewCard({
  assetTag,
  ubicacion,
  capacidadKW,
  seguridad,
  imageURI,
  consumoEntregado,
  consumoRestante,
}: PolePreviewCardProps) {
  const getSeguridadColor = (score: number) => {
    if (score >= 5) return "bg-green-500/10 text-green-500 border-green-500/20"
    if (score >= 0) return "bg-amber-500/10 text-amber-500 border-amber-500/20"
    return "bg-red-500/10 text-red-500 border-red-500/20"
  }

  const getSeguridadLabel = (score: number) => {
    if (score >= 5) return "Buena"
    if (score >= 0) return "Regular"
    return "Baja"
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Vista Previa del Poste</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image */}
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
          <Image src={imageURI || "/placeholder.svg"} alt={assetTag} fill className="object-cover" />
        </div>

        {/* Asset Tag */}
        <div>
          <p className="text-sm text-muted-foreground">Asset Tag</p>
          <p className="font-mono text-lg font-semibold">{assetTag}</p>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Ubicación</p>
            <p className="text-sm">{ubicacion}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Capacity */}
          <div className="rounded-lg border border-border/50 bg-card p-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <p className="text-xs text-muted-foreground">Capacidad</p>
            </div>
            <p className="mt-1 text-lg font-semibold">{capacidadKW} kW</p>
          </div>

          {/* Security */}
          <div className="rounded-lg border border-border/50 bg-card p-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Seguridad</p>
            </div>
            <Badge className={`mt-1 ${getSeguridadColor(seguridad)}`}>
              {getSeguridadLabel(seguridad)} ({seguridad > 0 ? "+" : ""}
              {seguridad})
            </Badge>
          </div>

          {/* Delivered */}
          <div className="rounded-lg border border-border/50 bg-card p-3">
            <p className="text-xs text-muted-foreground">Entregado</p>
            <p className="mt-1 text-lg font-semibold">{consumoEntregado.toLocaleString()} kWh</p>
          </div>

          {/* Remaining */}
          <div className="rounded-lg border border-border/50 bg-card p-3">
            <p className="text-xs text-muted-foreground">Restante</p>
            <p className="mt-1 text-lg font-semibold">{consumoRestante.toLocaleString()} kWh</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
