"use client"

import { useEffect, useState } from "react"
import { cacheManager } from "@/lib/cache-manager"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CacheMetricsPage() {
  const [metrics, setMetrics] = useState(cacheManager.getMetrics())
  const { toast } = useToast()

  const refreshMetrics = () => {
    setMetrics(cacheManager.getMetrics())
  }

  const clearCache = () => {
    cacheManager.clear()
    refreshMetrics()
    toast({
      title: "Caché limpiado",
      description: "Todos los datos en caché han sido eliminados",
    })
  }

  useEffect(() => {
    const interval = setInterval(refreshMetrics, 2000)
    return () => clearInterval(interval)
  }, [])

  const hitRate = ((metrics.hits / (metrics.hits + metrics.misses || 1)) * 100).toFixed(1)

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Métricas de Caché</h1>
          <p className="text-muted-foreground">M4-S3: Optimización y monitoreo de caché</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshMetrics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button variant="destructive" size="sm" onClick={clearCache}>
            <Trash2 className="w-4 h-4 mr-2" />
            Limpiar Caché
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Tasa de Aciertos</div>
          <div className="text-3xl font-bold text-green-600">{hitRate}%</div>
          <div className="text-xs text-muted-foreground mt-1">
            {metrics.hits} hits / {metrics.misses} misses
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Latencia Promedio</div>
          <div className="text-3xl font-bold">{metrics.averageLatency.toFixed(0)}ms</div>
          <div className="text-xs text-muted-foreground mt-1">Tiempo de respuesta</div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Total de Consultas</div>
          <div className="text-3xl font-bold">{metrics.hits + metrics.misses}</div>
          <div className="text-xs text-muted-foreground mt-1">Desde inicio de sesión</div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Distribución por Nivel de Caché</h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Memoria (L1)</span>
              <span className="text-sm text-muted-foreground">{metrics.memoryHits} hits</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{
                  width: `${(metrics.memoryHits / (metrics.hits || 1)) * 100}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">localStorage (L2)</span>
              <span className="text-sm text-muted-foreground">{metrics.localStorageHits} hits</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: `${(metrics.localStorageHits / (metrics.hits || 1)) * 100}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">API (L3)</span>
              <span className="text-sm text-muted-foreground">{metrics.apiHits} hits</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full transition-all"
                style={{
                  width: `${(metrics.apiHits / (metrics.hits || 1)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="text-sm font-semibold mb-2">Estrategia de Caché</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Memoria: Caché en RAM, más rápido (~1ms)</li>
            <li>• localStorage: Persistente entre sesiones (~5ms)</li>
            <li>• API: Fetch desde servidor (~100-500ms)</li>
            <li>• Stale-while-revalidate: Retorna caché y actualiza en background</li>
            <li>• Failover automático: Si API falla, usa datos stale</li>
          </ul>
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          Última actualización: {new Date(metrics.lastUpdate).toLocaleString("es-CO")}
        </div>
      </Card>
    </div>
  )
}
