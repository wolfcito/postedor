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
import { DemoSection } from "./demo-section"
import { SearchSection } from "./search-section"
import { FeaturesSection } from "./feature-sections"

export function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const [assetTag, setAssetTag] = useState("")
  const [isResolving, setIsResolving] = useState(false)
  const [stars, setStars] = useState<Array<{ left: number; top: number; animationDelay: number; animationDuration: number }>>([])

  useEffect(() => {
    // Generate stars only on client side to avoid hydration mismatch
    setStars(
      [...Array(50)].map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 3,
        animationDuration: 2 + Math.random() * 3,
      }))
    )
  }, [])

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
    <div className="relative overflow-hidden bg-black min-h-screen">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="stars-container">
          {stars.map((star, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                animationDelay: `${star.animationDelay}s`,
                animationDuration: `${star.animationDuration}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="page-shell py-16 relative z-10">
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
          <SearchSection />
          <DemoSection />
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

          <FeaturesSection />
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

        {/* Footer global renderizado desde RootLayout */}
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
