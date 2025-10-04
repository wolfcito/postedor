"use client"

import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

interface TimelineErrorProps {
  onRetry: () => void
}

export function TimelineError({ onRetry }: TimelineErrorProps) {
  return (
    <Card className="p-12 text-center border-destructive/50">
      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
      <h3 className="text-lg font-semibold mb-2">Error al cargar el historial</h3>
      <p className="text-sm text-muted-foreground mb-6">
        No se pudo cargar el historial de operaciones. Por favor, verifica tu conexión e intenta nuevamente.
      </p>
      <Button onClick={onRetry} variant="outline">
        <RefreshCw className="w-4 h-4 mr-2" />
        Reintentar
      </Button>
    </Card>
  )
}
