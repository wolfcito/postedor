"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import type { GasEstimate } from "@/lib/mock-blockchain-tx"

interface TransactionPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  operation: "mint" | "intervention"
  data: any
  onConfirm: () => void
}

export function TransactionPreviewDialog({
  open,
  onOpenChange,
  operation,
  data,
  onConfirm,
}: TransactionPreviewDialogProps) {
  const [gasEstimate, setGasEstimate] = useState<GasEstimate | null>(null)
  const [isEstimating, setIsEstimating] = useState(false)
  const [estimateError, setEstimateError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      estimateGas()
    }
  }, [open])

  const estimateGas = async () => {
    setIsEstimating(true)
    setEstimateError(null)

    try {
      const { estimateGas: estimateGasFn } = await import("@/lib/mock-blockchain-tx")
      const estimate = await estimateGasFn(operation)
      setGasEstimate(estimate)
    } catch (error) {
      console.error("[v0] Gas estimation error:", error)
      setEstimateError("No se pudo estimar el gas. Intente nuevamente.")
    } finally {
      setIsEstimating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar Transacción</DialogTitle>
          <DialogDescription>Revise los detalles de la transacción antes de enviarla a la blockchain</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Operation Details */}
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Operación:</span>
              <span className="font-medium">{operation === "mint" ? "Crear Poste" : "Registrar Intervención"}</span>
            </div>
            {data.assetTag && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Asset Tag:</span>
                <span className="font-mono text-xs">{data.assetTag}</span>
              </div>
            )}
            {data.tokenId && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Token ID:</span>
                <span className="font-mono text-xs">#{data.tokenId}</span>
              </div>
            )}
          </div>

          {/* Gas Estimate */}
          {isEstimating ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Estimando gas...</span>
            </div>
          ) : estimateError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{estimateError}</AlertDescription>
            </Alert>
          ) : gasEstimate ? (
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Gas Limit:</span>
                <span className="font-mono text-xs">{gasEstimate.gasLimit}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Gas Price:</span>
                <span className="font-mono text-xs">{gasEstimate.gasPrice} Gwei</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Max Fee:</span>
                <span className="font-mono text-xs">{gasEstimate.maxFeePerGas} Gwei</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Costo Estimado:</span>
                  <div className="text-right">
                    <div className="font-mono text-sm">{gasEstimate.estimatedCost} ETH</div>
                    <div className="text-xs text-muted-foreground">${gasEstimate.estimatedCostUSD} USD</div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Esta es una transacción simulada. En producción, se conectará a una wallet real para firmar la
              transacción.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={isEstimating || !!estimateError} className="w-full sm:w-auto">
            {isEstimating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Estimando...
              </>
            ) : (
              "Confirmar y Enviar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
