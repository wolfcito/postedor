"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { QRCodeSVG } from "qrcode.react"

interface QRCodePreviewProps {
  tokenId: string
  assetTag: string
}

export function QRCodePreview({ tokenId: _tokenId, assetTag }: QRCodePreviewProps) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  const qrUrl = `${baseUrl}/p/${assetTag}`

  const handleDownload = () => {
    const svg = document.getElementById("qr-code-svg")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL("image/png")

      const downloadLink = document.createElement("a")
      downloadLink.download = `QR-${assetTag}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Código QR</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code */}
        <div className="flex justify-center rounded-lg bg-white p-6">
          <QRCodeSVG id="qr-code-svg" value={qrUrl} size={200} level="H" includeMargin />
        </div>

        {/* URL */}
        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground">URL del Poste</p>
          <p className="mt-1 break-all font-mono text-sm">{qrUrl}</p>
        </div>

        {/* Download Button */}
        <Button onClick={handleDownload} variant="outline" className="w-full bg-transparent" size="lg">
          <Download className="mr-2 h-4 w-4" />
          Descargar QR
        </Button>

        {/* Physical Sticker Guidance */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Guía de Instalación:</strong>
            <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
              <li>Imprimir en material resistente al agua</li>
              <li>Tamaño recomendado: 10x10 cm mínimo</li>
              <li>Colocar a 1.5-2m de altura</li>
              <li>Proteger de luz solar directa</li>
              <li>Verificar escaneo antes de sellar</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
