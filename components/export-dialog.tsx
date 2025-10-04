"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Download, FileJson, FileSpreadsheet, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { generateCSV, generateJSON, downloadFile, generateFilename } from "@/lib/export-utils"
import type { ExportPoleData, ExportMetadata, ExportFormat, ReportFilters } from "@/lib/types"

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: ReportFilters
}

export function ExportDialog({ open, onOpenChange, filters }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("csv")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleExport = async () => {
    const startTime = Date.now()
    console.log("[v0] [Export] Starting export with format:", format)
    console.log("[v0] [Export] Filters:", filters)

    setLoading(true)
    setError(null)

    try {
      // Build query params
      const params = new URLSearchParams()
      if (filters.startDate) params.set("startDate", filters.startDate)
      if (filters.endDate) params.set("endDate", filters.endDate)
      if (filters.ubicacion) params.set("ubicacion", filters.ubicacion)
      if (filters.seguridadMinima !== undefined) params.set("seguridadMinima", filters.seguridadMinima.toString())

      // Fetch export data
      const response = await fetch(`/api/reports/export?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch export data")

      const data: ExportPoleData[] = await response.json()

      // Generate metadata
      const metadata: ExportMetadata = {
        exportedAt: new Date().toISOString(),
        filters,
        totalRecords: data.length,
        format,
      }

      // Generate file content
      let content: string
      let mimeType: string

      if (format === "csv") {
        content = generateCSV(data, metadata)
        mimeType = "text/csv;charset=utf-8;"
      } else {
        content = generateJSON(data, metadata)
        mimeType = "application/json;charset=utf-8;"
      }

      // Download file
      const filename = generateFilename(format)
      downloadFile(content, filename, mimeType)

      const duration = Date.now() - startTime
      console.log(`[v0] [Export] Export completed in ${duration}ms`)
      console.log("[v0] [Analytics] Export event:", { format, recordCount: data.length, duration })

      // Show success toast
      toast({
        title: "Exportación exitosa",
        description: `Se descargó ${filename} con ${data.length} registros.`,
      })

      // Close dialog
      onOpenChange(false)
    } catch (err) {
      console.error("[v0] [Export] Error:", err)
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)

      toast({
        title: "Error al exportar",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar Datos de Postes</DialogTitle>
          <DialogDescription>
            Selecciona el formato de exportación. Los datos respetarán los filtros actuales.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Format Selection */}
          <RadioGroup value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
            <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent cursor-pointer">
              <RadioGroupItem value="csv" id="csv" />
              <Label htmlFor="csv" className="flex items-center gap-3 cursor-pointer flex-1">
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">CSV</div>
                  <div className="text-sm text-muted-foreground">Compatible con Excel y Google Sheets</div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent cursor-pointer">
              <RadioGroupItem value="json" id="json" />
              <Label htmlFor="json" className="flex items-center gap-3 cursor-pointer flex-1">
                <FileJson className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">JSON</div>
                  <div className="text-sm text-muted-foreground">Para integración con APIs y sistemas</div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error al exportar</p>
                <p className="text-xs mt-1">{error}</p>
                <p className="text-xs mt-2">
                  Intenta nuevamente o{" "}
                  <a href="/help" className="underline">
                    contacta soporte
                  </a>
                  .
                </p>
              </div>
            </div>
          )}

          {/* Filter Summary */}
          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-medium">Filtros aplicados:</p>
            {filters.startDate && <p>• Fecha inicio: {filters.startDate}</p>}
            {filters.endDate && <p>• Fecha fin: {filters.endDate}</p>}
            {filters.ubicacion && <p>• Ubicación: {filters.ubicacion}</p>}
            {filters.seguridadMinima !== undefined && <p>• Seguridad mínima: {filters.seguridadMinima}</p>}
            {!filters.startDate && !filters.endDate && !filters.ubicacion && filters.seguridadMinima === undefined && (
              <p>• Sin filtros (todos los datos)</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={loading} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
