"use client"

import { useState, useEffect } from "react"
import { useSetReading } from "@/hooks/use-postedor-contract"
import { generateAttestationUID } from "@/lib/contract-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle2, Activity } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAccount } from "wagmi"

interface PosteRecordReadingProps {
  tokenId: string
  currentDelivered: number
  currentRemaining: number
}

export function PosteRecordReading({ tokenId, currentDelivered, currentRemaining }: PosteRecordReadingProps) {
  const { toast } = useToast()
  const { isConnected } = useAccount()
  const { setReading, hash, isPending, isConfirming, isConfirmed, error } = useSetReading()

  const [open, setOpen] = useState(false)
  const [deliveredKWh, setDeliveredKWh] = useState("")
  const [remainingKWh, setRemainingKWh] = useState("")

  // Handle confirmation
  useEffect(() => {
    if (isConfirmed && hash) {
      toast({
        title: "Lectura registrada",
        description: `Transacción confirmada: ${hash.slice(0, 10)}...`,
      })

      // Save to database
      fetch("/api/admin/record-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId,
          deliveredKWh: Number(deliveredKWh),
          remainingKWh: Number(remainingKWh),
          txHash: hash,
        }),
      }).then(() => {
        setOpen(false)
        setDeliveredKWh("")
        setRemainingKWh("")
        // Refresh page to show new data
        window.location.reload()
      })
    }
  }, [isConfirmed, hash, tokenId, deliveredKWh, remainingKWh, toast])

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

    if (!deliveredKWh || !remainingKWh) {
      toast({
        title: "Error",
        description: "Completa todos los campos",
        variant: "destructive",
      })
      return
    }

    const delivered = BigInt(deliveredKWh)
    const remaining = BigInt(remainingKWh)
    const attestationUID = generateAttestationUID()

    setReading(BigInt(tokenId), delivered, remaining, attestationUID)
  }

  if (!isConnected) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Activity className="h-4 w-4 mr-2" />
          Registrar Lectura
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Lectura de Consumo</DialogTitle>
          <DialogDescription>
            Actualiza los valores de consumo del poste #{tokenId}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="delivered">Consumo Entregado (kWh)</Label>
            <Input
              id="delivered"
              type="number"
              placeholder={currentDelivered.toString()}
              value={deliveredKWh}
              onChange={(e) => setDeliveredKWh(e.target.value)}
              disabled={isPending || isConfirming}
            />
            <p className="text-xs text-muted-foreground">Actual: {currentDelivered} kWh</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remaining">Consumo Restante (kWh)</Label>
            <Input
              id="remaining"
              type="number"
              placeholder={currentRemaining.toString()}
              value={remainingKWh}
              onChange={(e) => setRemainingKWh(e.target.value)}
              disabled={isPending || isConfirming}
            />
            <p className="text-xs text-muted-foreground">Actual: {currentRemaining} kWh</p>
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
            <Button type="submit" className="flex-1" disabled={isPending || isConfirming}>
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
