"use client"

import { useState } from "react"
import { FileCheck, ExternalLink, Calendar, User, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"

interface AttestationBadgeProps {
  uid: string
  href?: string
}

export function AttestationBadge({ uid, href }: AttestationBadgeProps) {
  const [open, setOpen] = useState(false)
  const shortUid = `${uid.slice(0, 6)}...${uid.slice(-4)}`

  const attestationDetails = {
    uid,
    schema: "Pole Verification Schema v1.0",
    attester: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    timestamp: new Date().toISOString(),
    status: "Verified",
    chain: "Base Sepolia",
  }

  const content = (
    <Badge
      variant="outline"
      className="font-mono text-xs bg-info/5 text-info border-info/20 hover:bg-info/10 transition-colors cursor-pointer"
      onClick={() => setOpen(true)}
    >
      <FileCheck className="w-3 h-3 mr-1.5" />
      {shortUid}
    </Badge>
  )

  return (
    <>
      {content}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-info" />
              Detalles de Verificación
            </DialogTitle>
            <DialogDescription>Información de la attestación on-chain</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="p-4 bg-muted/50">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">UID de Attestación</p>
                    <p className="text-sm font-mono break-all">{attestationDetails.uid}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileCheck className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Schema</p>
                    <p className="text-sm">{attestationDetails.schema}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">Attestador</p>
                    <p className="text-sm font-mono break-all">{attestationDetails.attester}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                    <p className="text-sm">
                      {new Date(attestationDetails.timestamp).toLocaleString("es-CO", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t">
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    {attestationDetails.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{attestationDetails.chain}</span>
                </div>
              </div>
            </Card>

            {href && (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm text-info hover:underline"
              >
                Ver en explorador de bloques
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
