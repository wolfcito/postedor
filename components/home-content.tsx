"use client"

import type React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QrCode, Zap, Activity, Shield, Search, ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const [assetTag, setAssetTag] = useState("")
  const [isResolving, setIsResolving] = useState(false)

  useEffect(() => {
    if (searchParams.get("error") === "not-found") {
      console.log("[v0] Telemetry: Asset tag resolution failed", {
        timestamp: new Date().toISOString(),
        source: "home_page_redirect",
      })
      toast({
        title: "Poste no encontrado",
        description: "El asset tag ingresado no corresponde a ningún poste registrado.",
        variant: "destructive",
      })
    }
  }, [searchParams, toast])

  const handleAssetTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assetTag.trim()) return

    console.log("[v0] Telemetry: Asset tag resolver initiated", {
      timestamp: new Date().toISOString(),
      assetTag: assetTag.trim(),
      source: "home_page_input",
    })

    setIsResolving(true)

    // Simulate brief loading for better UX
    await new Promise((resolve) => setTimeout(resolve, 300))

    router.push(`/a/${encodeURIComponent(assetTag.trim())}`)
  }

  const handleDemoCTAClick = (poleId: string) => {
    console.log("[v0] Telemetry: Demo CTA clicked", {
      timestamp: new Date().toISOString(),
      poleId,
      source: "home_page_cta",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Zap className="w-8 h-8" aria-hidden="true" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">Postedor</h1>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Sistema de seguimiento de infraestructura eléctrica con verificación on-chain
          </p>
        </div>

        {/* Asset Tag Input */}
        <Card className="p-6 md:p-8 mb-16 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-3 text-center">Buscar por Asset Tag</h2>
            <p className="text-muted-foreground text-center mb-6">
              Ingresa el identificador del poste para ver su información completa
            </p>
            <form onSubmit={handleAssetTagSubmit} className="flex gap-3">
              <Input
                type="text"
                placeholder="Ej: POSTE-MDE-000134"
                value={assetTag}
                onChange={(e) => setAssetTag(e.target.value)}
                disabled={isResolving}
                className="text-lg h-12"
                aria-label="Asset tag del poste"
              />
              <Button type="submit" size="lg" disabled={isResolving || !assetTag.trim()} className="px-8">
                {isResolving ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" aria-hidden="true" />
                    Buscar
                  </>
                )}
              </Button>
            </form>
          </div>
        </Card>

        {/* ¿Cómo funciona? Section */}
        <section className="mb-16" aria-labelledby="how-it-works-heading">
          <h2 id="how-it-works-heading" className="text-3xl font-bold text-center mb-12">
            ¿Cómo funciona?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <span className="text-2xl font-bold" aria-hidden="true">
                  1
                </span>
              </div>
              <div className="inline-block p-3 rounded-xl bg-primary/10 text-primary mb-4">
                <QrCode className="w-8 h-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-3">Escanea el QR</h3>
              <p className="text-muted-foreground text-pretty">
                Cada poste tiene un código QR único. Escanéalo con tu dispositivo móvil para acceder instantáneamente.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-info/10 text-info mb-4">
                <span className="text-2xl font-bold" aria-hidden="true">
                  2
                </span>
              </div>
              <div className="inline-block p-3 rounded-xl bg-info/10 text-info mb-4">
                <Activity className="w-8 h-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-3">Revisa la información</h3>
              <p className="text-muted-foreground text-pretty">
                Visualiza capacidad, consumo, estado de seguridad y ubicación del poste en tiempo real.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 text-success mb-4">
                <span className="text-2xl font-bold" aria-hidden="true">
                  3
                </span>
              </div>
              <div className="inline-block p-3 rounded-xl bg-success/10 text-success mb-4">
                <Shield className="w-8 h-8" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold mb-3">Consulta el historial</h3>
              <p className="text-muted-foreground text-pretty">
                Accede al timeline completo de mantenimientos, lecturas y reemplazos verificados on-chain.
              </p>
            </Card>
          </div>
        </section>

        {/* Demo CTA Section */}
        <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Prueba el sistema ahora</h2>
            <p className="text-lg text-muted-foreground mb-8 text-balance">
              Explora un poste de demostración para ver cómo funciona el sistema de seguimiento
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8" onClick={() => handleDemoCTAClick("1")}>
                <Link href="/p/1">
                  Ver Poste de Demo
                  <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-lg px-8 bg-transparent"
                onClick={() => handleDemoCTAClick("2")}
              >
                <Link href="/p/2">Ver Segundo Ejemplo</Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* Features Grid */}
        <section className="mt-16" aria-labelledby="features-heading">
          <h2 id="features-heading" className="text-2xl font-bold text-center mb-8">
            Características principales
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <CheckCircle2 className="w-8 h-8 text-success mb-3" aria-hidden="true" />
              <h3 className="font-semibold mb-2">Verificación on-chain</h3>
              <p className="text-sm text-muted-foreground">Cada evento está respaldado por attestations verificables</p>
            </Card>
            <Card className="p-6">
              <Activity className="w-8 h-8 text-info mb-3" aria-hidden="true" />
              <h3 className="font-semibold mb-2">Actualizaciones en tiempo real</h3>
              <p className="text-sm text-muted-foreground">
                Timeline que se actualiza automáticamente con nuevos eventos
              </p>
            </Card>
            <Card className="p-6">
              <Shield className="w-8 h-8 text-warning mb-3" aria-hidden="true" />
              <h3 className="font-semibold mb-2">Monitoreo de seguridad</h3>
              <p className="text-sm text-muted-foreground">
                Score de seguridad basado en inspecciones y mantenimientos
              </p>
            </Card>
            <Card className="p-6">
              <QrCode className="w-8 h-8 text-primary mb-3" aria-hidden="true" />
              <h3 className="font-semibold mb-2">Acceso instantáneo</h3>
              <p className="text-sm text-muted-foreground">Escanea el QR y accede a toda la información en segundos</p>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
