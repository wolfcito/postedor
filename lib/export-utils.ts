import type { ExportPoleData, ExportMetadata } from "./types"

/**
 * Convert pole data to CSV format with metadata headers
 */
export function generateCSV(data: ExportPoleData[], metadata: ExportMetadata): string {
  console.log("[v0] [Export] Generating CSV with", data.length, "records")

  // Metadata headers
  const metadataLines = [
    `# Postedor - Exportación de Datos de Postes`,
    `# Fecha de exportación: ${new Date(metadata.exportedAt).toLocaleString("es-CO")}`,
    `# Total de registros: ${metadata.totalRecords}`,
    `# Filtros aplicados:`,
  ]

  if (metadata.filters.startDate) {
    metadataLines.push(`#   - Fecha inicio: ${metadata.filters.startDate}`)
  }
  if (metadata.filters.endDate) {
    metadataLines.push(`#   - Fecha fin: ${metadata.filters.endDate}`)
  }
  if (metadata.filters.ubicacion) {
    metadataLines.push(`#   - Ubicación: ${metadata.filters.ubicacion}`)
  }
  if (metadata.filters.seguridadMinima !== undefined) {
    metadataLines.push(`#   - Seguridad mínima: ${metadata.filters.seguridadMinima}`)
  }

  metadataLines.push(`#`)

  // CSV headers
  const headers = [
    "Token ID",
    "Asset Tag",
    "Ubicación",
    "Capacidad (kW)",
    "Entregado (kWh)",
    "Restante (kWh)",
    "Seguridad",
    "Intervenciones",
    "Última Attestation",
    "Actualizado",
  ]

  // CSV rows
  const rows = data.map((pole) => [
    pole.tokenId,
    pole.assetTag,
    pole.ubicacion,
    pole.capacidadKW,
    pole.consumoEntregado,
    pole.consumoRestante,
    pole.seguridad,
    pole.interventionCount,
    pole.lastAttestationUID,
    new Date(pole.updatedAt).toLocaleString("es-CO"),
  ])

  // Combine everything
  const csv = [
    ...metadataLines,
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n")

  console.log("[v0] [Export] CSV generated successfully")
  return csv
}

/**
 * Convert pole data to JSON format with metadata
 */
export function generateJSON(data: ExportPoleData[], metadata: ExportMetadata): string {
  console.log("[v0] [Export] Generating JSON with", data.length, "records")

  const json = {
    metadata: {
      exportedAt: metadata.exportedAt,
      exportedAtFormatted: new Date(metadata.exportedAt).toLocaleString("es-CO"),
      totalRecords: metadata.totalRecords,
      filters: metadata.filters,
      source: "Postedor - Sistema de Gestión de Postes",
    },
    data,
  }

  console.log("[v0] [Export] JSON generated successfully")
  return JSON.stringify(json, null, 2)
}

/**
 * Trigger browser download of a file
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  console.log("[v0] [Export] Triggering download:", filename)

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  console.log("[v0] [Export] Download triggered successfully")
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(format: "csv" | "json"): string {
  const timestamp = new Date().toISOString().split("T")[0]
  return `postedor-export-${timestamp}.${format}`
}
