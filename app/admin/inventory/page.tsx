import Link from "next/link"
import { ArrowLeft, AlertTriangle, CheckCircle2, Database } from "lucide-react"

import { fetchPosteInventory } from "@/lib/poste-inventory"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const revalidate = 0
export const dynamic = "force-dynamic"

const numberFormatter = new Intl.NumberFormat("es-CO")
const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
})

export default async function AdminInventoryPage() {
  const inventory = await fetchPosteInventory()

  const total = inventory.length
  const mintedCount = inventory.filter((item) => item.minted).length
  const offlineCount = total - mintedCount
  const discrepancyCount = inventory.filter((item) => item.discrepancy).length

  return (
    <div className="page-shell space-y-8 py-8">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Inventario de Postes</h1>
          <p className="text-muted-foreground">Consulta el estado on-chain y local de cada asset tag registrado</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de registros</CardTitle>
            <Database className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{total}</div>
            <CardDescription>Incluye datos locales y sincronizados</CardDescription>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sincronizados on-chain</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-500">{mintedCount}</div>
            <CardDescription>Postes confirmados en contrato</CardDescription>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes / Conflictos</CardTitle>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-amber-500">{offlineCount + discrepancyCount}</div>
            <CardDescription>
              {offlineCount} en local • {discrepancyCount} con diferencias
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Detalle de postes</CardTitle>
          <CardDescription>
            Usa esta vista para validar que cada asset tag esté asociado al token correcto y detectar duplicados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {inventory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay postes registrados aún.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Asset tag</th>
                    <th className="px-4 py-3 text-left">Token on-chain</th>
                    <th className="px-4 py-3 text-left">Token fallback</th>
                    <th className="px-4 py-3 text-left">Estado</th>
                    <th className="px-4 py-3 text-left">Última actualización</th>
                    <th className="px-4 py-3 text-right">Consumo (kWh)</th>
                    <th className="px-4 py-3 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {inventory.map((entry) => {
                    const { poste } = entry
                    const displayAssetTag = entry.assetTag ?? "—"
                    const location = poste.ubicacion || "Ubicación no disponible"
                    const updatedAt = poste.updatedAt ? dateFormatter.format(new Date(poste.updatedAt)) : "—"
                    const delivered = numberFormatter.format(poste.consumoEntregado ?? 0)
                    const remaining = numberFormatter.format(poste.consumoRestante ?? 0)
                    const slug = entry.assetTag ?? entry.resolvedTokenId

                    return (
                      <tr key={`${entry.resolvedTokenId}-${entry.assetTag ?? "na"}`} className="bg-background/50">
                        <td className="px-4 py-3 align-top">
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{displayAssetTag}</span>
                            <span className="text-xs text-muted-foreground">{location}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top font-mono text-xs text-foreground">
                          #{entry.resolvedTokenId}
                        </td>
                        <td className="px-4 py-3 align-top font-mono text-xs text-muted-foreground">
                          {entry.fallbackTokenId ? `#${entry.fallbackTokenId}` : "—"}
                        </td>
                        <td className="px-4 py-3 align-top space-y-1">
                          <Badge variant={entry.minted ? "secondary" : "outline"} className={entry.minted ? "bg-green-500/10 text-green-500" : undefined}>
                            {entry.minted ? "On-chain" : "Solo local"}
                          </Badge>
                          {entry.discrepancy && (
                            <Badge variant="destructive">Conflicto</Badge>
                          )}
                          {entry.source === "contract" && !entry.minted && (
                            <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
                              Lectura directa
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="text-xs text-muted-foreground">{updatedAt}</div>
                          <div className="text-[10px] uppercase text-muted-foreground/70">
                            Fuente: {entry.source === "contract" ? "Contrato" : "Mock"}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex flex-col text-right font-mono text-xs">
                            <span className="text-foreground">{delivered}</span>
                            <span className="text-muted-foreground">Δ {remaining}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/p/${slug}`} target="_blank" rel="noreferrer">
                              Ver poste
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
