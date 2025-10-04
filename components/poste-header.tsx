import Image from "next/image"
import { Shield, MapPin } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AttestationBadge } from "@/components/attestation-badge"

interface PosteHeaderProps {
  imageURI: string
  tokenId: string
  assetTag?: string
  seguridad: number
  ubicacion: string
  lastAttestationUID?: string
}

export function PosteHeader({
  imageURI,
  tokenId,
  assetTag,
  seguridad,
  ubicacion,
  lastAttestationUID,
}: PosteHeaderProps) {
  const getSeguridadColor = (score: number) => {
    if (score >= 5) return "bg-success/10 text-success border-success/20"
    if (score >= 0) return "bg-warning/10 text-warning border-warning/20"
    return "bg-destructive/10 text-destructive border-destructive/20"
  }

  const getSeguridadLabel = (score: number) => {
    if (score >= 5) return "Excelente"
    if (score >= 0) return "Aceptable"
    return "Requiere atención"
  }

  return (
    <Card className="overflow-hidden border-2">
      <div className="flex flex-col md:flex-row gap-6 p-6">
        <div className="relative w-full md:w-64 h-64 rounded-xl overflow-hidden bg-muted flex-shrink-0">
          <Image src={imageURI || "/placeholder.svg"} alt={`Poste ${tokenId}`} fill className="object-cover" priority />
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h1 className="text-3xl font-bold text-balance">Poste #{tokenId}</h1>
                {assetTag && <p className="text-sm text-muted-foreground font-mono mt-1">{assetTag}</p>}
              </div>
              <Badge
                variant="outline"
                className={`${getSeguridadColor(seguridad)} flex items-center gap-1.5 px-3 py-1.5`}
              >
                <Shield className="w-4 h-4" />
                <span className="font-semibold">{getSeguridadLabel(seguridad)}</span>
              </Badge>
            </div>

            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-base">{ubicacion}</p>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <p className="text-sm text-muted-foreground">
              Última actualización:{" "}
              <span className="text-foreground font-medium">
                {new Date().toLocaleDateString("es-CO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </p>
            {lastAttestationUID && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Verificación:</span>
                <AttestationBadge uid={lastAttestationUID} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
