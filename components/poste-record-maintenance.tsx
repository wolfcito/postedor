"use client"

import { useState, useEffect } from "react"
import { useRecordMaintenance } from "@/hooks/use-postedor-contract"
import { generateAttestationUID } from "@/lib/contract-utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle2, Wrench } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAccount } from "wagmi"

interface PosteRecordMaintenanceProps {
  tokenId: string
}

const MAINTENANCE_TYPES = [
  { value: 0, label: "Inspección Rutinaria" },
  { value: 1, label: "Mantenimiento Preventivo" },
  { value: 2, label: "Reparación Menor" },
  { value: 3, label: "Reparación Mayor" },
  { value: 4, label: "Limpieza" },
  { value: 5, label: "Calibración" },
]

export function PosteRecordMaintenance({ tokenId }: PosteRecordMaintenanceProps) {
  const { toast } = useToast()
  const { isConnected } = useAccount()
  const { recordMaintenance, hash, isPending, isConfirming, isConfirmed, error } = useRecordMaintenance()

  const [open, setOpen] = useState(false)
  const [maintenanceType, setMaintenanceType] = useState<string>("")

  // Handle confirmation
  useEffect(() => {
    if (isConfirmed && hash) {
      toast({
        title: "Mantenimiento registrado",
        description: `Transacción confirmada: ${hash.slice(0, 10)}...`,
      })

      // Save to database
      fetch("/api/admin/record-maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId,
          maintenanceType: Number(maintenanceType),
          txHash: hash,
        }),
      }).then(() => {
        setOpen(false)
        setMaintenanceType("")
        // Refresh page to show new data
        window.location.reload()
      })
    }
  }, [isConfirmed, hash, tokenId, maintenanceType, toast])

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }, [error, toast])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!maintenanceType) {
      toast({
        title: "Error",
        description: "Selecciona un tipo de mantenimiento",
        variant: "destructive",
      })
      return
    }

    const attestationUID = generateAttestationUID()
    recordMaintenance(BigInt(tokenId), Number(maintenanceType), attestationUID)
  }

  if (!isConnected) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Wrench className="h-4 w-4 mr-2" />
          Registrar Mantenimiento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Mantenimiento</DialogTitle>
          <DialogDescription>
            Registra una intervención de mantenimiento en el poste #{tokenId}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="maintenanceType">Tipo de Mantenimiento</Label>
            <Select value={maintenanceType} onValueChange={setMaintenanceType} disabled={isPending || isConfirming}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tipo de mantenimiento" />
              </SelectTrigger>
              <SelectContent>
                {MAINTENANCE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value.toString()}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hash && (
            <div className="space-y-2 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Transaction Hash</p>
              <p className="font-mono text-sm break-all">{hash}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1" disabled={isPending || isConfirming}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending || isConfirming || !maintenanceType}>
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isPending ? "Esperando firma..." : "Confirmando..."}
                </>
              ) : isConfirmed ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirmado
                </>
              ) : (
                "Registrar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
