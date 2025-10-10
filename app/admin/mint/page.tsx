"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft, Wallet } from "lucide-react"
import { PolePreviewCard } from "@/components/pole-preview-card"
import { QRCodePreview } from "@/components/qr-code-preview"
import Link from "next/link"
import { TransactionPreviewDialog } from "@/components/transaction-preview-dialog"
import { TransactionStatusTracker } from "@/components/transaction-status-tracker"
import { submitTransaction, type MockTransaction } from "@/lib/mock-blockchain-tx"
import { useAccount, useSwitchChain } from "wagmi"
import { useMintPoste } from "@/hooks/use-postedor-contract"
import { hashContractData } from "@/lib/contract-utils"
import { WalletConnect } from "@/components/wallet-connect"
import { polkadotAssetHubTestnet } from "@/lib/wagmi"

export default function MintPolePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { address, isConnected, chainId } = useAccount()
  const { switchChain } = useSwitchChain()
  const { mintPoste: mintPosteContract, hash, isPending, isConfirming, isConfirmed, error: contractError } = useMintPoste()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mintedPoste, setMintedPoste] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showTxPreview, setShowTxPreview] = useState(false)
  const [currentTx, setCurrentTx] = useState<MockTransaction | null>(null)
  const [useBlockchain, setUseBlockchain] = useState(false)

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

  // Handle contract confirmation
  useEffect(() => {
    if (isConfirmed && hash && useBlockchain) {
      // Contract transaction confirmed, now save to database
      const saveToDatabase = async () => {
        try {
          const response = await fetch("/api/admin/mint", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...formData,
              capacidadKW: Number(formData.capacidadKW),
              seguridad: Number(formData.seguridad),
              consumoEntregado: Number(formData.consumoEntregado),
              consumoRestante: Number(formData.consumoRestante || formData.capacidadKW) * 1000,
              txHash: hash,
            }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || "Error al guardar en base de datos")
          }

          setMintedPoste(data.poste)
          toast({
            title: "Poste creado exitosamente",
            description: `Poste #${data.poste.tokenId} minteado en blockchain`,
          })

          console.log("[v0] [MINT] Contract Success:", {
            tokenId: data.poste.tokenId,
            assetTag: data.poste.assetTag,
            txHash: hash,
          })
        } catch (error) {
          console.error("[v0] [MINT] Database Error:", error)
          toast({
            title: "Error al guardar",
            description: error instanceof Error ? error.message : "Error al guardar en base de datos",
            variant: "destructive",
          })
        } finally {
          setIsSubmitting(false)
        }
      }

      saveToDatabase()
    }
  }, [isConfirmed, hash, useBlockchain, formData, toast])

  // Handle contract errors
  useEffect(() => {
    if (contractError) {
      console.error("[v0] [MINT] Contract Error:", contractError)
      toast({
        title: "Error en el contrato",
        description: contractError.message,
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }, [contractError, toast])

  const handleConfirmTransaction = async () => {
    setShowTxPreview(false)
    setIsSubmitting(true)
    const startTime = Date.now()

    try {
      let txHash: string

      // If connected to blockchain and user chose to use it, mint via contract
      if (useBlockchain && isConnected && address) {
        console.log("[v0] [MINT] Using blockchain contract")

        // Check if we're on the correct chain
        if (chainId !== polkadotAssetHubTestnet.id) {
          console.log(`[v0] [MINT] Wrong chain detected (${chainId}), switching to Paseo...`)
          try {
            await switchChain({ chainId: polkadotAssetHubTestnet.id })
            toast({
              title: "Red cambiada",
              description: "Conectado a Polkadot Asset Hub Testnet",
            })
          } catch (switchError) {
            console.error("[v0] [MINT] Chain switch error:", switchError)
            toast({
              variant: "destructive",
              title: "Error al cambiar de red",
              description: "Por favor cambia manualmente a Polkadot Asset Hub Testnet en tu wallet",
            })
            setIsSubmitting(false)
            return
          }
        }

        // Hash the data for contract
        const { assetTagHash, ubicacionHash, imageURIHash } = hashContractData({
          assetTag: formData.assetTag,
          ubicacion: formData.ubicacion,
          imageURI: formData.imageURI,
        })

        // Log gas estimation
        console.log("[v0] [MINT] Gas estimation:", {
          operation: "mint",
          address,
          chainId,
          formData: {
            assetTagHash,
            ubicacionHash,
            capacidadKW: Number(formData.capacidadKW),
            seguridad: Number(formData.seguridad),
            imageURIHash,
          },
        })

        // Call contract mint function
        mintPosteContract(
          address,
          assetTagHash!,
          ubicacionHash!,
          Number(formData.capacidadKW),
          Number(formData.seguridad),
          imageURIHash!
        )

        // Wait for confirmation
        // The useEffect below will handle the rest
        return
      } else {
        console.log("[v0] [MINT] Using mock blockchain")

        // Submit mock blockchain transaction
        const tx = await submitTransaction("mint", {
          ...formData,
          capacidadKW: Number(formData.capacidadKW),
          seguridad: Number(formData.seguridad),
          consumoEntregado: Number(formData.consumoEntregado),
          consumoRestante: Number(formData.consumoRestante || formData.capacidadKW) * 1000,
        })

        setCurrentTx(tx)
        txHash = tx.hash
      }

      // Call the API to create the pole in the database
      const response = await fetch("/api/admin/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          capacidadKW: Number(formData.capacidadKW),
          seguridad: Number(formData.seguridad),
          consumoEntregado: Number(formData.consumoEntregado),
          consumoRestante: Number(formData.consumoRestante || formData.capacidadKW) * 1000,
          txHash,
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
        description: `Poste #${data.poste.tokenId} registrado con tx ${txHash.slice(0, 10)}...`,
      })

      console.log("[v0] [MINT] Success:", {
        tokenId: data.poste.tokenId,
        assetTag: data.poste.assetTag,
        txHash,
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
      <div className="page-shell max-w-4xl space-y-6 py-8">
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
          <Button onClick={() => router.push(`/p/${mintedPoste.assetTag}`)} size="lg" className="flex-1">
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
    <div className="page-shell max-w-6xl space-y-6 py-8">
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

      {/* Wallet Connection Section */}
      <div className="space-y-4">
        <WalletConnect />

        {isConnected && (
          <Card className="border-blue-500/50 bg-blue-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Wallet className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-semibold text-blue-500 mb-1">Minteo en Blockchain</h3>
                    <p className="text-sm text-muted-foreground">
                      ¿Deseas mintear este poste directamente en el contrato de Polkadot Asset Hub?
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={useBlockchain ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseBlockchain(true)}
                    >
                      Usar Contrato Real
                    </Button>
                    <Button
                      variant={!useBlockchain ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseBlockchain(false)}
                    >
                      Usar Mock (Local)
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
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

      {currentTx && isSubmitting && !useBlockchain && (
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

      {useBlockchain && isSubmitting && (isPending || isConfirming) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                {isPending ? "Esperando confirmación del wallet..." : "Confirmando transacción en blockchain..."}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hash && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                  <p className="font-mono text-sm break-all">{hash}</p>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  <span className="text-sm">Firma de wallet</span>
                </div>
                <div className="flex items-center gap-2">
                  {isConfirming ? (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  ) : isConfirmed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-muted" />
                  )}
                  <span className="text-sm">Confirmación en blockchain</span>
                </div>
                <div className="flex items-center gap-2">
                  {isConfirmed ? (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-muted" />
                  )}
                  <span className="text-sm">Guardando en base de datos</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
