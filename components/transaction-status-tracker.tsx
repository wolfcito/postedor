"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle, ExternalLink, Clock } from "lucide-react"
import { getExplorerUrl } from "@/lib/mock-blockchain-tx"
import type { MockTransaction } from "@/lib/mock-blockchain-tx"

interface TransactionStatusTrackerProps {
  transaction: MockTransaction
  onComplete?: () => void
}

export function TransactionStatusTracker({ transaction, onComplete }: TransactionStatusTrackerProps) {
  const [tx, setTx] = useState(transaction)

  useEffect(() => {
    // Poll for transaction updates
    const interval = setInterval(() => {
      // In a real implementation, we'd fetch the latest tx status
      // For mock, we just update the local state
      setTx((prev) => ({ ...prev }))

      if (tx.status === "confirmed" || tx.status === "failed") {
        clearInterval(interval)
        if (onComplete) {
          onComplete()
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [tx.status, onComplete])

  const getStatusIcon = () => {
    switch (tx.status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "confirming":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case "confirmed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusText = () => {
    switch (tx.status) {
      case "pending":
        return "Pendiente"
      case "confirming":
        return `Confirmando (${tx.confirmations}/3)`
      case "confirmed":
        return "Confirmada"
      case "failed":
        return "Fallida"
    }
  }

  const getStatusColor = () => {
    switch (tx.status) {
      case "pending":
        return "border-yellow-500/50 bg-yellow-500/10"
      case "confirming":
        return "border-blue-500/50 bg-blue-500/10"
      case "confirmed":
        return "border-green-500/50 bg-green-500/10"
      case "failed":
        return "border-red-500/50 bg-red-500/10"
    }
  }

  return (
    <Card className={`p-4 ${getStatusColor()}`}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div className="flex-1">
            <div className="font-medium">{getStatusText()}</div>
            <div className="text-xs text-muted-foreground font-mono">{tx.hash.slice(0, 20)}...</div>
          </div>
        </div>

        {tx.blockNumber && (
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bloque:</span>
              <span className="font-mono">#{tx.blockNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Confirmaciones:</span>
              <span className="font-mono">{tx.confirmations}</span>
            </div>
          </div>
        )}

        {tx.error && <div className="text-sm text-red-500 bg-red-500/10 p-2 rounded">{tx.error}</div>}

        <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
          <a href={getExplorerUrl(tx.hash)} target="_blank" rel="noopener noreferrer">
            Ver en Explorer
            <ExternalLink className="ml-2 h-3 w-3" />
          </a>
        </Button>
      </div>
    </Card>
  )
}
