import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: Promise<{ hash: string }>
}

export default async function TransactionPage({ params }: PageProps) {
  const { hash } = await params

  return (
    <div className="min-h-screen bg-background">
      <div className="page-shell max-w-4xl py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>

        <Card className="p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-4 rounded-xl bg-primary/10 text-primary">
              <ExternalLink className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">Transaction Mock Explorer</h1>
              <Badge variant="outline" className="font-mono">
                {hash}
              </Badge>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-muted-foreground mb-2">Este es un explorador simulado de transacciones.</p>
              <p className="text-muted-foreground">
                En producción, esto enlazaría a un explorador blockchain real (ej: Etherscan, Basescan).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground mb-1">Hash</p>
                <code className="text-xs font-mono break-all">{hash}</code>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Estado</p>
                <Badge className="bg-success/10 text-success border-success/20">Confirmado</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
