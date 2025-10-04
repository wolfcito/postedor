"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react"
import { PolePreviewCard } from "@/components/pole-preview-card"
import { QRCodePreview } from "@/components/qr-code-preview"
import Link from "next/link"
import { TransactionPreviewDialog } from "@/components/transaction-preview-dialog"
import { TransactionStatusTracker } from "@/components/transaction-status-tracker"
import { submitTransaction, type MockTransaction } from "@/lib/mock-blockchain-tx"

export default function MintPolePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mintedPoste, setMintedPoste] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showTxPreview, setShowTxPreview] = useState(false)
  const [currentTx, setCurrentTx] = useState<MockTransaction | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    assetTag: "",
    ubicacion: "",
    capacidadKW: "",
    seguridad: "0",
    imageURI: "",
    consumoEntregado: "0",
    consumoRestante: "",
  })

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.assetTag.trim()) {
      newErrors.assetTag = "Asset tag es requerido"
    } else if (!/^POSTE-[A-Z]{3}-\d{6}$/.test(formData.assetTag)) {
      newErrors.assetTag = "Formato: POSTE-XXX-000000"
    }

    if (!formData.ubicacion.trim()) {
      newErrors.ubicacion = "Ubicación es requerida"
    }

    const capacidad = Number(formData.capacidadKW)
    if (!formData.capacidadKW || capacidad <= 0) {
      newErrors.capacidadKW = "Capacidad debe ser mayor a 0"
    }

    const seguridad = Number(formData.seguridad)
    if (seguridad < -10 || seguridad > 10) {
      newErrors.seguridad = "Seguridad debe estar entre -10 y +10"
    }

    if (!formData.imageURI.trim()) {
      newErrors.imageURI = "URI de imagen es requerida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      // Auto-calculate remaining if capacity changes
      ...(field === "capacidadKW" && !prev.consumoRestante
        ? { consumoRestante: (Number(value) * 1000).toString() }
        : {}),
    }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handlePreview = () => {
    if (validateForm()) {
      setShowPreview(true)
      console.log("[v0] [MINT] Preview generated for:", formData.assetTag)
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setShowTxPreview(true)
  }

  const handleConfirmTransaction = async () => {
    setShowTxPreview(false)
    setIsSubmitting(true)
    const startTime = Date.now()

    try {
      // Submit blockchain transaction
      const tx = await submitTransaction("mint", {
        ...formData,
        capacidadKW: Number(formData.capacidadKW),
        seguridad: Number(formData.seguridad),
        consumoEntregado: Number(formData.consumoEntregado),
        consumoRestante: Number(formData.consumoRestante || formData.capacidadKW) * 1000,
      })

      setCurrentTx(tx)

      // Wait for transaction to be confirmed
      // In parallel, call the API to create the pole
      const response = await fetch("/api/admin/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          capacidadKW: Number(formData.capacidadKW),
          seguridad: Number(formData.seguridad),
          consumoEntregado: Number(formData.consumoEntregado),
          consumoRestante: Number(formData.consumoRestante || formData.capacidadKW) * 1000,
          txHash: tx.hash,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.code === "DUPLICATE_ASSET_TAG") {
          toast({
            title: "Asset tag duplicado",
            description: `Este asset tag ya existe en el poste #${data.existingTokenId}`,
            variant: "destructive",
          })
          console.log("[v0] [MINT] Duplicate blocked:", formData.assetTag)
        } else {
          throw new Error(data.error || "Error al crear poste")
        }
        return
      }

      setMintedPoste(data.poste)
      toast({
        title: "Poste creado exitosamente",
        description: `Poste #${data.poste.tokenId} registrado con tx ${tx.hash.slice(0, 10)}...`,
      })

      console.log("[v0] [MINT] Success:", {
        tokenId: data.poste.tokenId,
        assetTag: data.poste.assetTag,
        txHash: tx.hash,
        duration: Date.now() - startTime,
      })
    } catch (error) {
      console.error("[v0] [MINT] Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear poste",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success view
  if (mintedPoste) {
    return (
      <div className="container mx-auto max-w-4xl space-y-6 p-4 py-8">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Poste Creado</h1>
            <p className="text-muted-foreground">Token ID: #{mintedPoste.tokenId}</p>
          </div>
        </div>

        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-500">
            El poste ha sido registrado exitosamente. Descarga el código QR e instálalo en el poste físico.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2">
          <PolePreviewCard
            assetTag={mintedPoste.assetTag}
            ubicacion={mintedPoste.ubicacion}
            capacidadKW={mintedPoste.capacidadKW}
            seguridad={mintedPoste.seguridad}
            imageURI={mintedPoste.imageURI}
            consumoEntregado={mintedPoste.consumoEntregado}
            consumoRestante={mintedPoste.consumoRestante}
          />
          <QRCodePreview tokenId={mintedPoste.tokenId} assetTag={mintedPoste.assetTag} />
        </div>

        <div className="flex gap-3">
          <Button onClick={() => router.push(`/p/${mintedPoste.tokenId}`)} size="lg" className="flex-1">
            Ver Poste
          </Button>
          <Button
            onClick={() => {
              setMintedPoste(null)
              setFormData({
                assetTag: "",
                ubicacion: "",
                capacidadKW: "",
                seguridad: "0",
                imageURI: "",
                consumoEntregado: "0",
                consumoRestante: "",
              })
              setShowPreview(false)
            }}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            Crear Otro
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-4 py-8">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Crear Nuevo Poste</h1>
          <p className="text-muted-foreground">Registra un poste en el sistema</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Poste</CardTitle>
            <CardDescription>Completa todos los campos requeridos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Asset Tag */}
            <div className="space-y-2">
              <Label htmlFor="assetTag">
                Asset Tag <span className="text-red-500">*</span>
              </Label>
              <Input
                id="assetTag"
                placeholder="POSTE-MDE-000136"
                value={formData.assetTag}
                onChange={(e) => handleInputChange("assetTag", e.target.value.toUpperCase())}
                className={errors.assetTag ? "border-red-500" : ""}
              />
              {errors.assetTag && <p className="text-sm text-red-500">{errors.assetTag}</p>}
              <p className="text-xs text-muted-foreground">Formato: POSTE-XXX-000000</p>
            </div>

            {/* Ubicación */}
            <div className="space-y-2">
              <Label htmlFor="ubicacion">
                Ubicación <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ubicacion"
                placeholder="Medellín - CLL 50 #80-12"
                value={formData.ubicacion}
                onChange={(e) => handleInputChange("ubicacion", e.target.value)}
                className={errors.ubicacion ? "border-red-500" : ""}
              />
              {errors.ubicacion && <p className="text-sm text-red-500">{errors.ubicacion}</p>}
            </div>

            {/* Capacidad */}
            <div className="space-y-2">
              <Label htmlFor="capacidadKW">
                Capacidad (kW) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="capacidadKW"
                type="number"
                placeholder="60"
                value={formData.capacidadKW}
                onChange={(e) => handleInputChange("capacidadKW", e.target.value)}
                className={errors.capacidadKW ? "border-red-500" : ""}
              />
              {errors.capacidadKW && <p className="text-sm text-red-500">{errors.capacidadKW}</p>}
            </div>

            {/* Seguridad */}
            <div className="space-y-2">
              <Label htmlFor="seguridad">
                Seguridad (-10 a +10) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="seguridad"
                type="number"
                min="-10"
                max="10"
                placeholder="0"
                value={formData.seguridad}
                onChange={(e) => handleInputChange("seguridad", e.target.value)}
                className={errors.seguridad ? "border-red-500" : ""}
              />
              {errors.seguridad && <p className="text-sm text-red-500">{errors.seguridad}</p>}
            </div>

            {/* Image URI */}
            <div className="space-y-2">
              <Label htmlFor="imageURI">
                URI de Imagen <span className="text-red-500">*</span>
              </Label>
              <Input
                id="imageURI"
                placeholder="/placeholder.svg?height=400&width=400"
                value={formData.imageURI}
                onChange={(e) => handleInputChange("imageURI", e.target.value)}
                className={errors.imageURI ? "border-red-500" : ""}
              />
              {errors.imageURI && <p className="text-sm text-red-500">{errors.imageURI}</p>}
            </div>

            {/* Consumo Entregado */}
            <div className="space-y-2">
              <Label htmlFor="consumoEntregado">Consumo Entregado (kWh)</Label>
              <Input
                id="consumoEntregado"
                type="number"
                placeholder="0"
                value={formData.consumoEntregado}
                onChange={(e) => handleInputChange("consumoEntregado", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Dejar en 0 para postes nuevos</p>
            </div>

            {/* Consumo Restante */}
            <div className="space-y-2">
              <Label htmlFor="consumoRestante">Consumo Restante (kWh)</Label>
              <Input
                id="consumoRestante"
                type="number"
                placeholder="Auto-calculado"
                value={formData.consumoRestante}
                onChange={(e) => handleInputChange("consumoRestante", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Se calcula automáticamente si se deja vacío</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handlePreview}
                variant="outline"
                className="flex-1 bg-transparent"
                disabled={isSubmitting}
              >
                Vista Previa
              </Button>
              <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting || !showPreview}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Poste"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <div className="space-y-6">
          {showPreview ? (
            <>
              <PolePreviewCard
                assetTag={formData.assetTag}
                ubicacion={formData.ubicacion}
                capacidadKW={Number(formData.capacidadKW)}
                seguridad={Number(formData.seguridad)}
                imageURI={formData.imageURI}
                consumoEntregado={Number(formData.consumoEntregado)}
                consumoRestante={Number(formData.consumoRestante || Number(formData.capacidadKW) * 1000)}
              />
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Revisa la información antes de confirmar. El código QR se generará después de crear el poste.
                </AlertDescription>
              </Alert>
            </>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex min-h-[400px] items-center justify-center p-6">
                <p className="text-center text-muted-foreground">
                  Completa el formulario y haz clic en "Vista Previa" para ver cómo se verá el poste
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <TransactionPreviewDialog
        open={showTxPreview}
        onOpenChange={setShowTxPreview}
        operation="mint"
        data={formData}
        onConfirm={handleConfirmTransaction}
      />

      {currentTx && isSubmitting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <TransactionStatusTracker
              transaction={currentTx}
              onComplete={() => {
                setCurrentTx(null)
                setIsSubmitting(false)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
