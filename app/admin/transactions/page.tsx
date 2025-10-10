"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Download, ExternalLink, Search } from "lucide-react"
import { getExplorerUrl } from "@/lib/mock-blockchain-tx"
import type { BlockchainTransaction, TransactionFilters } from "@/lib/types"

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([])
  const [filters, setFilters] = useState<TransactionFilters>({
    type: "all",
    status: "all",
    search: "",
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTransactions()
  }, [filters])

  const loadTransactions = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.type && filters.type !== "all") params.append("type", filters.type)
      if (filters.status && filters.status !== "all") params.append("status", filters.status)
      if (filters.search) params.append("search", filters.search)
      if (filters.startDate) params.append("startDate", filters.startDate)
      if (filters.endDate) params.append("endDate", filters.endDate)

      const response = await fetch(`/api/admin/transactions?${params}`)
      const data = await response.json()
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error("[v0] Error loading transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportTransactions = () => {
    const csv = [
      ["Hash", "Type", "Status", "Operation", "Block", "Confirmations", "Gas Cost", "Timestamp"].join(","),
      ...transactions.map((tx) =>
        [
          tx.hash,
          tx.type,
          tx.status,
          tx.operation,
          tx.blockNumber || "",
          tx.confirmations,
          tx.gasCost || "",
          tx.timestamp,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transactions-${new Date().toISOString()}.csv`
    a.click()
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      confirming: "default",
      confirmed: "outline",
      failed: "destructive",
    }
    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  return (
    <div className="page-shell max-w-7xl py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Transacciones Blockchain</h1>
          <p className="text-muted-foreground">M5-S3: Monitor de transacciones on-chain</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadTransactions}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button variant="outline" size="sm" onClick={exportTransactions}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por hash o asset tag..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-9"
            />
          </div>
          <Select value={filters.type} onValueChange={(value: any) => setFilters({ ...filters, type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="mint">Mint</SelectItem>
              <SelectItem value="intervention">Intervención</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={(value: any) => setFilters({ ...filters, status: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="confirming">Confirmando</SelectItem>
              <SelectItem value="confirmed">Confirmada</SelectItem>
              <SelectItem value="failed">Fallida</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            placeholder="Fecha inicio"
          />
        </div>
      </Card>

      {/* Transactions List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : transactions.length === 0 ? (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <p>No se encontraron transacciones</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <Card key={tx.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    {getStatusBadge(tx.status)}
                    <Badge variant="outline">{tx.type}</Badge>
                    <span className="text-sm font-medium">{tx.operation}</span>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">{tx.hash}</div>
                  {tx.assetTag && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Asset Tag:</span> {tx.assetTag}
                    </div>
                  )}
                  {tx.blockNumber && (
                    <div className="flex gap-4 text-sm">
                      <span>
                        <span className="text-muted-foreground">Bloque:</span> #{tx.blockNumber}
                      </span>
                      <span>
                        <span className="text-muted-foreground">Confirmaciones:</span> {tx.confirmations}
                      </span>
                      {tx.gasCost && (
                        <span>
                          <span className="text-muted-foreground">Gas:</span> {tx.gasCost} ETH
                        </span>
                      )}
                    </div>
                  )}
                  {tx.error && <div className="text-sm text-red-500">{tx.error}</div>}
                  <div className="text-xs text-muted-foreground">{new Date(tx.timestamp).toLocaleString("es-CO")}</div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a href={getExplorerUrl(tx.hash)} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
