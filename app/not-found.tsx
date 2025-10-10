"use client"

import Link from "next/link"
import { SatelliteDish, Compass, Zap, Bolt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background flex items-center">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Card className="border-border/60 bg-card/80 backdrop-blur">
          <CardContent className="p-10 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-4">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <SatelliteDish className="h-10 w-10" />
                </span>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">404</p>
                  <h1 className="text-3xl font-bold tracking-tight">Poste fuera de cobertura</h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    No pudimos sincronizar este asset tag con Paseo. Tal vez aún no ha sido minteado, o el identificador contiene
                    un error tipográfico.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="rounded-xl border border-border/60 bg-background/60 p-5">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-primary" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Comprueba el asset tag
                  </h2>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Verifica que el código físico coincida con el formato <span className="font-mono">POSTE-XXX-000000</span> y que no
                  tenga espacios extras.
                </p>
              </div>

              <div className="rounded-xl border border-border/60 bg-background/60 p-5">
                <div className="flex items-center gap-3">
                  <Compass className="h-5 w-5 text-primary" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Consulta el inventario
                  </h2>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Revisa el panel administrativo para confirmar si el poste ya está registrado o si requiere minteo manual.
                </p>
              </div>

              <div className="rounded-xl border border-border/60 bg-background/60 p-5">
                <div className="flex items-center gap-3">
                  <Bolt className="h-5 w-5 text-primary" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Emite una nueva lectura
                  </h2>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Si el poste fue recientemente instalado, asegúrate de que se haya emitido la transacción de minteo y propagado en la
                  red.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/">Regresar al inicio</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/inventory">Abrir inventario</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/admin/mint">Registrar un poste</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
