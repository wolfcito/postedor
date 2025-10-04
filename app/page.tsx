"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QrCode, Zap, Activity, Shield } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    if (searchParams.get("error") === "not-found") {
      toast({
        title: "Poste no encontrado",
        description: "El asset tag ingresado no corresponde a ningún poste registrado.",
        variant: "destructive",
      })
    }
  }, [searchParams, toast])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Zap className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold">Postedor</h1>
          </div>
          <p className="text-xl text-muted-foreground text-balance">
            Sistema de seguimiento de infraestructura eléctrica
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="p-8 text-center">
            <div className="mb-6">
              <div className="inline-block p-4 rounded-xl bg-primary/10 text-primary mb-4">
                <QrCode className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Escanear QR</h2>
              <p className="text-muted-foreground">Escanea el código QR en el poste para ver su información completa</p>
            </div>
            <div className="bg-muted/50 p-6 rounded-xl mb-4">
              <Image src="/qr-code.png" alt="QR Code de ejemplo" width={200} height={200} className="mx-auto" />
              <p className="text-xs text-muted-foreground mt-3">QR de ejemplo - Poste #1</p>
            </div>
            <Button asChild className="w-full">
              <Link href="/p/1">Ver Poste de Ejemplo</Link>
            </Button>
          </Card>

          <Card className="p-8">
            <div className="mb-6">
              <div className="inline-block p-4 rounded-xl bg-info/10 text-info mb-4">
                <Activity className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Características</h2>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Información en tiempo real</p>
                  <p className="text-sm text-muted-foreground">Capacidad, consumo y estado de seguridad</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-info mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Historial completo</p>
                  <p className="text-sm text-muted-foreground">Mantenimientos, lecturas y reemplazos</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <QrCode className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Acceso rápido</p>
                  <p className="text-sm text-muted-foreground">Escanea el QR y accede instantáneamente</p>
                </div>
              </li>
            </ul>
          </Card>
        </div>

        <Card className="p-6 bg-muted/50">
          <h3 className="font-semibold mb-3">Postes de ejemplo:</h3>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/p/1">Poste #1 - POSTE-MDE-000134</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/p/2">Poste #2 - POSTE-MDE-000135</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/a/POSTE-MDE-000134">Resolver por AssetTag</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
