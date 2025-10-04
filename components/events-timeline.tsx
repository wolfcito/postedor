import type { PosteEvent } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wrench, Zap, PaintBucket, Shield, RefreshCw, Activity } from "lucide-react"
import { AttestationBadge } from "./attestation-badge"
import { TxLink } from "./tx-link"

interface EventsTimelineProps {
  events: PosteEvent[]
}

export function EventsTimeline({ events }: EventsTimelineProps) {
  const getMaintenanceIcon = (kind: number) => {
    switch (kind) {
      case 0:
        return Shield // Preventivo
      case 1:
        return Wrench // Correctivo
      case 2:
        return PaintBucket // Repintado
      case 3:
        return Zap // Transformador
      case 4:
        return Activity // Vandalismo
      default:
        return Wrench
    }
  }

  const getMaintenanceLabel = (kind: number) => {
    switch (kind) {
      case 0:
        return "Preventivo"
      case 1:
        return "Correctivo"
      case 2:
        return "Repintado"
      case 3:
        return "Transformador"
      case 4:
        return "Vandalismo"
      default:
        return "Mantenimiento"
    }
  }

  const getEventColor = (type: string, kind?: number) => {
    if (type === "MAINTENANCE") {
      if (kind === 0) return "bg-success/10 text-success border-success/20"
      if (kind === 4) return "bg-destructive/10 text-destructive border-destructive/20"
      return "bg-warning/10 text-warning border-warning/20"
    }
    if (type === "READING") return "bg-info/10 text-info border-info/20"
    return "bg-primary/10 text-primary border-primary/20"
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return {
      date: date.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }
  }

  if (events.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">Aún no hay operaciones registradas</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => {
        const { date, time } = formatDate(event.ts)

        return (
          <Card key={event.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex gap-4">
              {/* Timeline indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={`p-3 rounded-xl ${
                    event.type === "MAINTENANCE"
                      ? getEventColor(event.type, event.maintenanceKind)
                      : getEventColor(event.type)
                  }`}
                >
                  {event.type === "MAINTENANCE" && (
                    <>
                      {(() => {
                        const Icon = getMaintenanceIcon(event.maintenanceKind)
                        return <Icon className="w-5 h-5" />
                      })()}
                    </>
                  )}
                  {event.type === "READING" && <Activity className="w-5 h-5" />}
                  {event.type === "REPLACEMENT" && <RefreshCw className="w-5 h-5" />}
                </div>
                {index < events.length - 1 && <div className="w-0.5 h-full min-h-8 bg-border mt-2" />}
              </div>

              {/* Event content */}
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {event.type === "MAINTENANCE" && `Mantenimiento ${getMaintenanceLabel(event.maintenanceKind)}`}
                      {event.type === "READING" && "Lectura de Consumo"}
                      {event.type === "REPLACEMENT" && "Reemplazo de Equipo"}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {date} • {time}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      event.type === "MAINTENANCE"
                        ? getEventColor(event.type, event.maintenanceKind)
                        : getEventColor(event.type)
                    }
                  >
                    {event.type === "MAINTENANCE" && getMaintenanceLabel(event.maintenanceKind)}
                    {event.type === "READING" && "Lectura"}
                    {event.type === "REPLACEMENT" && "Reemplazo"}
                  </Badge>
                </div>

                {/* Event-specific data */}
                {event.type === "MAINTENANCE" && event.notes && (
                  <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg">{event.notes}</p>
                )}

                {event.type === "READING" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Entregado</p>
                      <p className="text-lg font-semibold">{event.deliveredKWh.toLocaleString("es-CO")} kWh</p>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Restante</p>
                      <p className="text-lg font-semibold">{event.remainingKWh.toLocaleString("es-CO")} kWh</p>
                    </div>
                  </div>
                )}

                {event.type === "REPLACEMENT" && (
                  <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Anterior:</span>
                      <code className="font-mono font-semibold">{event.oldSerial}</code>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Nuevo:</span>
                      <code className="font-mono font-semibold text-success">{event.newSerial}</code>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Operador:</span>
                    <code className="text-xs font-mono bg-muted px-2 py-1 rounded">{event.actor}</code>
                  </div>
                  <AttestationBadge uid={event.attestationUID} href={`/mock/attestation/${event.attestationUID}`} />
                  <TxLink hash={event.txHash} href={`/mock/tx/${event.txHash}`} />
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
