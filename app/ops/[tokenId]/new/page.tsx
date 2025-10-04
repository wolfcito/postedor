import { Suspense } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getPosteByTokenId } from "@/lib/mock-service"
import { InterventionTabs } from "@/components/intervention-tabs"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

interface PageProps {
  params: Promise<{ tokenId: string }>
}

async function InterventionContent({ tokenId }: { tokenId: string }) {
  console.log("[v0] Loading intervention form for pole", tokenId)

  try {
    const poste = await getPosteByTokenId(tokenId)

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/p/${tokenId}`}>
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Volver al poste</span>
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Nueva Intervención</h1>
                <p className="text-muted-foreground">
                  Poste #{tokenId} - {poste.ubicacion}
                </p>
              </div>
            </div>

            {/* Intervention Form */}
            <InterventionTabs tokenId={tokenId} />

            {/* Help Text */}
            <Card className="p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Todos los eventos se registran en la blockchain y generan una attestación verificable. Los datos se
                actualizarán automáticamente en el historial del poste.
              </p>
            </Card>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("[v0] Error loading intervention form:", error)
    notFound()
  }
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-md bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-8 w-64 bg-muted animate-pulse rounded" />
              <div className="h-4 w-48 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <Card className="h-96 animate-pulse bg-muted" />
        </div>
      </div>
    </div>
  )
}

export default async function NewInterventionPage({ params }: PageProps) {
  const { tokenId } = await params

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <InterventionContent tokenId={tokenId} />
    </Suspense>
  )
}
