"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RefreshCw, SatelliteDish } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[postedor:error]", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background flex items-center">
      <div className="page-shell max-w-3xl py-16">
        <Card className="border-border/60 bg-card/80 backdrop-blur">
          <CardContent className="p-10 space-y-8">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-warning/10 text-warning">
                <SatelliteDish className="h-10 w-10" />
              </span>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Pérdida de señal</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tuvimos un problema al sincronizar con Paseo. Puede ser un RPC inestable o un hash fuera de rango. Nuestro equipo ya fue notificado.
                </p>
                {error.digest && (
                  <p className="mt-2 font-mono text-xs text-muted-foreground/70">Ref: {error.digest}</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-background/60 p-5 space-y-3">
              <div className="flex items-center gap-3 text-warning">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">Recomendaciones</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Confirma que el nodo RPC siga en línea o usa un endpoint archival.</li>
                <li>• Si estabas cargando un asset tag recién minteado, espera unos segundos y reintenta.</li>
                <li>• Comprueba que el identificador no contenga espacios o caracteres extra.</li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={reset}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/inventory">Abrir inventario</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/">Regresar al inicio</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
