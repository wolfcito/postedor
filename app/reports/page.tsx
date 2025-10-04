"use client"

import { useState, useEffect } from "react"
import { ReportFilters } from "@/components/report-filters"
import { ReportKPICards } from "@/components/report-kpi-cards"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, BarChart3, RefreshCw } from "lucide-react"
import type { ReportKPIs, ReportFilters as Filters } from "@/lib/types"

export default function ReportsPage() {
  const [filters, setFilters] = useState<Filters>({})
  const [kpis, setKpis] = useState<ReportKPIs | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [locations, setLocations] = useState<string[]>([])

  const fetchReports = async () => {
    const startTime = Date.now()
    console.log("[v0] [Reports] Fetching report data with filters:", filters)
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (filters.startDate) params.set("startDate", filters.startDate)
      if (filters.endDate) params.set("endDate", filters.endDate)
      if (filters.ubicacion) params.set("ubicacion", filters.ubicacion)
      if (filters.seguridadMinima !== undefined) params.set("seguridadMinima", filters.seguridadMinima.toString())

      const response = await fetch(`/api/reports?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch reports")

      const data: ReportKPIs = await response.json()
      setKpis(data)

      // Extract unique locations
      const uniqueLocations = Array.from(new Set(data.polesByLocation.map((p) => p.location)))
      setLocations(uniqueLocations)

      const duration = Date.now() - startTime
      console.log(`[v0] [Reports] Data loaded in ${duration}ms`)
    } catch (err) {
      console.error("[v0] [Reports] Error:", err)
      setError(err instanceof Error ? err.message : "Error al cargar los reportes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [filters])

  if (loading && !kpis) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Reportes Ejecutivos</h1>
          <p className="text-muted-foreground">Análisis de KPIs y puntos críticos de la flota</p>
        </div>
        <div className="space-y-4">
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Reportes Ejecutivos</h1>
          <p className="text-muted-foreground">Análisis de KPIs y puntos críticos de la flota</p>
        </div>
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error al cargar datos</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchReports}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </Card>
      </div>
    )
  }

  if (!kpis) return null

  const isEmpty = kpis.totalPoles === 0

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Reportes Ejecutivos</h1>
          <Button variant="outline" size="sm" onClick={fetchReports} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
        <p className="text-muted-foreground">Análisis de KPIs y puntos críticos de la flota</p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <ReportFilters filters={filters} onFiltersChange={setFilters} locations={locations} />
      </div>

      {isEmpty ? (
        <Card className="p-8 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No hay datos disponibles</h2>
          <p className="text-muted-foreground mb-4">
            No se encontraron postes o intervenciones con los filtros seleccionados.
          </p>
          <Button variant="outline" onClick={() => setFilters({})}>
            Limpiar filtros
          </Button>
        </Card>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="mb-6">
            <ReportKPICards kpis={kpis} />
          </div>

          {/* Top Incidents */}
          {kpis.topIncidents.length > 0 && (
            <Card className="p-4 md:p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Principales Incidentes</h2>
              <div className="space-y-3">
                {kpis.topIncidents.map((incident) => (
                  <div key={incident.kind} className="flex items-center justify-between">
                    <span className="text-sm">{incident.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500"
                          style={{
                            width: `${(incident.count / kpis.maintenanceCount) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-8 text-right">{incident.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Poles by Location */}
          {kpis.polesByLocation.length > 0 && (
            <Card className="p-4 md:p-6">
              <h2 className="text-lg font-semibold mb-4">Postes por Ciudad</h2>
              <div className="space-y-3">
                {kpis.polesByLocation.map((location) => (
                  <div key={location.location} className="flex items-center justify-between">
                    <span className="text-sm">{location.location}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{
                            width: `${(location.count / kpis.totalPoles) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-8 text-right">{location.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
