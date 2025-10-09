"use client"

import { useState, useEffect } from "react"
import { useRecordReplacement } from "@/hooks/use-postedor-contract"
import { generateAttestationUID, hashString } from "@/lib/contract-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle2, RefreshCw } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAccount } from "wagmi"

interface PosteRecordReplacementProps {
  tokenId: string
}

export function PosteRecordReplacement({ tokenId }: PosteRecordReplacementProps) {
  const { toast } = useToast()
  const { isConnected } = useAccount()
  const { recordReplacement, hash, isPending, isConfirming, isConfirmed, error } = useRecordReplacement()

  const [open, setOpen] = useState(false)
  const [oldPart, setOldPart] = useState("")
  const [newPart, setNewPart] = useState("")

  // Handle confirmation
  useEffect(() => {
    if (isConfirmed && hash) {
      toast({
        title: "Reemplazo registrado",
        description: `Transacción confirmada: ${hash.slice(0, 10)}...`,
      })

      // Save to database
      fetch("/api/admin/record-replacement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId,
          oldPart,
          newPart,
          txHash: hash,
        }),
      }).then(() => {
        setOpen(false)
        setOldPart("")
        setNewPart("")
        // Refresh page to show new data
        window.location.reload()
      })
    }
  }, [isConfirmed, hash, tokenId, oldPart, newPart, toast])

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

    if (!oldPart || !newPart) {
      toast({
        title: "Error",
        description: "Completa todos los campos",
        variant: "destructive",
      })
      return
    }

    const oldPartHash = hashString(oldPart)
    const newPartHash = hashString(newPart)
    const attestationUID = generateAttestationUID()

    recordReplacement(BigInt(tokenId), oldPartHash, newPartHash, attestationUID)
  }

  if (!isConnected) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Registrar Reemplazo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Reemplazo de Componente</DialogTitle>
          <DialogDescription>
            Registra el reemplazo de un componente en el poste #{tokenId}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="oldPart">Componente Antiguo</Label>
            <Input
              id="oldPart"
              placeholder="ej: Transformador ABC-123"
              value={oldPart}
              onChange={(e) => setOldPart(e.target.value)}
              disabled={isPending || isConfirming}
            />
            <p className="text-xs text-muted-foreground">Identificación del componente a reemplazar</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPart">Componente Nuevo</Label>
            <Input
              id="newPart"
              placeholder="ej: Transformador XYZ-456"
              value={newPart}
              onChange={(e) => setNewPart(e.target.value)}
              disabled={isPending || isConfirming}
            />
            <p className="text-xs text-muted-foreground">Identificación del componente nuevo</p>
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
