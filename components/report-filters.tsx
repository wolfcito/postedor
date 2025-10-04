"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"
import { Filter, X } from "lucide-react"
import type { ReportFiltersType } from "@/lib/types"

interface ReportFiltersProps {
  filters: ReportFiltersType
  onFiltersChange: (filters: ReportFiltersType) => void
  locations: string[]
}

export function ReportFilters({ filters, onFiltersChange, locations }: ReportFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleClearFilters = () => {
    onFiltersChange({})
    console.log("[v0] [Reports] Filters cleared")
  }

  const hasActiveFilters =
    filters.startDate || filters.endDate || filters.ubicacion || filters.seguridadMinima !== undefined

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Filtros</h2>
          {hasActiveFilters && (
            <span className="text-sm text-muted-foreground">({Object.keys(filters).length} activos)</span>
          )}
        </div>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-muted-foreground">
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="md:hidden">
            {isExpanded ? "Ocultar" : "Mostrar"}
          </Button>
        </div>
      </div>

      <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${isExpanded ? "block" : "hidden md:grid"}`}>
        {/* Date Range */}
        <div className="space-y-2">
          <Label htmlFor="startDate">Fecha Inicio</Label>
          <Input
            id="startDate"
            type="date"
            value={filters.startDate || ""}
            onChange={(e) => {
              onFiltersChange({ ...filters, startDate: e.target.value })
              console.log("[v0] [Reports] Start date filter:", e.target.value)
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Fecha Fin</Label>
          <Input
            id="endDate"
            type="date"
            value={filters.endDate || ""}
            onChange={(e) => {
              onFiltersChange({ ...filters, endDate: e.target.value })
              console.log("[v0] [Reports] End date filter:", e.target.value)
            }}
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="ubicacion">Ciudad / Ubicación</Label>
          <Select
            value={filters.ubicacion || "all"}
            onValueChange={(value) => {
              onFiltersChange({
                ...filters,
                ubicacion: value === "all" ? undefined : value,
              })
              console.log("[v0] [Reports] Location filter:", value)
            }}
          >
            <SelectTrigger id="ubicacion">
              <SelectValue placeholder="Todas las ubicaciones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las ubicaciones</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Security Score */}
        <div className="space-y-2">
          <Label htmlFor="seguridad">
            Seguridad Mínima: {filters.seguridadMinima !== undefined ? filters.seguridadMinima : "Todas"}
          </Label>
          <Slider
            id="seguridad"
            min={-10}
            max={10}
            step={1}
            value={[filters.seguridadMinima ?? -10]}
            onValueChange={([value]) => {
              onFiltersChange({
                ...filters,
                seguridadMinima: value === -10 ? undefined : value,
              })
              console.log("[v0] [Reports] Security filter:", value)
            }}
            className="mt-2"
          />
        </div>
      </div>
    </Card>
  )
}
