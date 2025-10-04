"use client"

import type React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QrCode, Zap, Activity, Shield, Search, ArrowRight, CheckCircle2, Sparkles } from "lucide-react"
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
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="stars-container">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-6xl relative z-10">
        <div className="text-center mb-20">
          <div className="flex justify-center mb-8">
          <div className="relative w-32 h-32">
            {/* 3D-style icon representing electrical infrastructure */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900 rounded-2xl transform rotate-12 shadow-2xl" />
            <div className="absolute inset-2 bg-gradient-to-br from-zinc-600 via-zinc-700 to-zinc-800 rounded-xl transform -rotate-6 shadow-xl" />
            <div className="absolute inset-4 bg-gradient-to-br from-zinc-500 via-zinc-600 to-zinc-700 rounded-lg flex items-center justify-center">
              <Zap className="w-12 h-12 text-yellow-400" />
            </div>
          </div>
      </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white text-balance">
            Postedor redefine la infraestructura eléctrica
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 text-balance max-w-3xl mx-auto leading-relaxed">
            La arquitectura de agentes sobre blockchain habilita la evolución de la infraestructura eléctrica: de endpoints pasivos a sistemas de acción interoperables.
          </p>

          <div className="flex items-center justify-center gap-4 mt-10">
            <Button
              asChild
              size="lg"
              className="bg-white text-black hover:bg-zinc-200 text-lg px-8 h-12 rounded-full font-semibold"
            >
              <Link href="#buscar">Comenzar Ahora</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full border border-zinc-700 hover:bg-zinc-800"
            >
              <a href="https://github.com/wolfcito/postedor" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </Button>
          </div>
        </div>

        <div id="buscar" className="mb-24">
          <Card className="p-8 md:p-12 bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Search className="w-6 h-6 text-zinc-400" />
                <h2 className="text-2xl font-bold text-white">Buscar por Asset Tag</h2>
              </div>
              <p className="text-zinc-400 text-center mb-8">
                Ingresa el identificador del poste para ver su información completa y historial verificado
              </p>
              <form onSubmit={handleAssetTagSubmit} className="flex gap-3">
                <Input
                  type="text"
                  placeholder="Ej: POSTE-MDE-000134"
                  value={assetTag}
                  onChange={(e) => setAssetTag(e.target.value)}
                  disabled={isResolving}
                  className="text-lg h-14 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  aria-label="Asset tag del poste"
                />
                <Button
                  type="submit"
                  size="lg"
                  disabled={isResolving || !assetTag.trim()}
                  className="px-8 h-14 bg-white text-black hover:bg-zinc-200 font-semibold"
                >
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

          <Card className="p-12 md:p-16 bg-gradient-to-br from-zinc-900 to-black border-zinc-800 backdrop-blur-sm mb-24">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6 text-white">Prueba el sistema ahora</h2>
            <p className="text-xl text-zinc-400 mb-10 text-balance">
              Explora un poste de demostración para ver cómo funciona el sistema de seguimiento verificado on-chain
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="text-lg px-10 h-14 bg-white text-black hover:bg-zinc-200 font-semibold rounded-full"
                onClick={() => handleDemoCTAClick("1")}
              >
                <Link href="/p/1">
                  Demo #1
                  <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-lg px-10 h-14 border-zinc-700 bg-transparent hover:bg-zinc-800 text-white rounded-full"
                onClick={() => handleDemoCTAClick("2")}
              >
                <Link href="/p/2">Demo #2</Link>
              </Button>
            </div>
          </div>
        </Card>
        </div>

        <section className="mb-24" aria-labelledby="how-it-works-heading">
          <div className="flex items-center justify-center gap-3 mb-16">
            <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700">
              <Sparkles className="w-5 h-5 text-zinc-400" />
            </div>
            <h2 id="how-it-works-heading" className="text-3xl font-bold text-white">
              Roadmap
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Phase 1 */}
            <div className="flex gap-8 mb-12">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-white" />
                <div className="w-0.5 h-full bg-zinc-800 mt-2" />
              </div>
              <div className="flex-1 pb-12">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-2xl font-bold text-white">Fase 1</h3>
                </div>
                <h4 className="text-xl font-semibold text-white mb-4">Escaneo y Acceso</h4>
                <ul className="space-y-2 text-zinc-400">
                  <li className="flex items-start gap-2">
                    <span className="text-white mt-1">→</span>
                    <span>Escanea el código QR único del poste</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white mt-1">→</span>
                    <span>Acceso instantáneo desde dispositivo móvil</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white mt-1">→</span>
                    <span>Resolución automática de Asset Tag</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white mt-1">→</span>
                    <span>Navegación directa a ficha del poste</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="flex gap-8 mb-12">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-white" />
                <div className="w-0.5 h-full bg-zinc-800 mt-2" />
              </div>
              <div className="flex-1 pb-12">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-2xl font-bold text-white">Fase 2</h3>
                </div>
                <h4 className="text-xl font-semibold text-white mb-4">Consulta de Información</h4>
                <ul className="space-y-2 text-zinc-400">
                  <li className="flex items-start gap-2">
                    <span className="text-white mt-1">→</span>
                    <span>Visualiza capacidad y consumo en tiempo real</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white mt-1">→</span>
                    <span>Revisa estado de seguridad y ubicación</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white mt-1">→</span>
                    <span>Accede al timeline completo de eventos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white mt-1">→</span>
                    <span>Verifica attestations on-chain</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="flex gap-8 mb-12">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-white" />
                <div className="w-0.5 h-full bg-zinc-800 mt-2" />
              </div>
              <div className="flex-1 pb-12">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-2xl font-bold text-white">Fase 3</h3>
                </div>
                <h4 className="text-xl font-semibold text-white mb-4">Registro de Intervenciones</h4>
                <ul className="space-y-2 text-zinc-400">
                  <li className="flex items-start gap-2">
                    <span className="text-white mt-1">→</span>
                    <span>Registra lecturas de consumo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white mt-1">→</span>
                    <span>Documenta mantenimientos realizados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white mt-1">→</span>
                    <span>Reporta reemplazos de componentes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white mt-1">→</span>
                    <span>Genera attestation verificable on-chain</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Phase 4 */}
            <div className="flex gap-8">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-2xl font-bold text-white">Fase 4</h3>
                </div>
                <h4 className="text-xl font-semibold text-white mb-4">Análisis y Reportes</h4>
                <ul className="space-y-2 text-zinc-400">
                  <li className="flex items-start gap-2">
                    <span className="text-white mt-1">→</span>
                    <span>Dashboard ejecutivo con KPIs de flota</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white mt-1">→</span>
                    <span>Exportación de datos para análisis externo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white mt-1">→</span>
                    <span>Monitoreo de transacciones blockchain</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-white mt-1">→</span>
                    <span>Métricas de cache y rendimiento</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="features-heading">
          <h2 id="features-heading" className="text-3xl font-bold text-center mb-12 text-white">
            Características principales
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-zinc-900/50 border-zinc-800 backdrop-blur-sm hover:bg-zinc-900 transition-colors">
              <CheckCircle2 className="w-10 h-10 text-green-400 mb-4" aria-hidden="true" />
              <h3 className="font-semibold mb-2 text-white text-lg">Verificación on-chain</h3>
              <p className="text-sm text-zinc-400">Cada evento está respaldado por attestations verificables</p>
            </Card>
            <Card className="p-6 bg-zinc-900/50 border-zinc-800 backdrop-blur-sm hover:bg-zinc-900 transition-colors">
              <Activity className="w-10 h-10 text-blue-400 mb-4" aria-hidden="true" />
              <h3 className="font-semibold mb-2 text-white text-lg">Tiempo real</h3>
              <p className="text-sm text-zinc-400">Timeline que se actualiza automáticamente con nuevos eventos</p>
            </Card>
            <Card className="p-6 bg-zinc-900/50 border-zinc-800 backdrop-blur-sm hover:bg-zinc-900 transition-colors">
              <Shield className="w-10 h-10 text-yellow-400 mb-4" aria-hidden="true" />
              <h3 className="font-semibold mb-2 text-white text-lg">Monitoreo de seguridad</h3>
              <p className="text-sm text-zinc-400">Score de seguridad basado en inspecciones y mantenimientos</p>
            </Card>
            <Card className="p-6 bg-zinc-900/50 border-zinc-800 backdrop-blur-sm hover:bg-zinc-900 transition-colors">
              <QrCode className="w-10 h-10 text-purple-400 mb-4" aria-hidden="true" />
              <h3 className="font-semibold mb-2 text-white text-lg">Acceso instantáneo</h3>
              <p className="text-sm text-zinc-400">Escanea el QR y accede a toda la información en segundos</p>
            </Card>
          </div>
        </section>

        <footer className="mt-32 pt-16 border-t border-zinc-800">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6 text-white" />
                <span className="font-bold text-white text-lg">Postedor</span>
              </div>
              <p className="text-sm text-zinc-500">© 2025 Postedor. All Rights Reserved.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Navegación</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link href="/reports" className="hover:text-white transition-colors">
                    Reportes
                  </Link>
                </li>
                <li>
                  <Link href="/admin/mint" className="hover:text-white transition-colors">
                    Admin
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Información</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentación
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API Reference
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Sociales</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <a href="https://github.com" className="hover:text-white transition-colors">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .stars-container {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 50%;
          animation: twinkle linear infinite;
        }
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
