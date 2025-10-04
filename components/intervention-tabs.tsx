"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Gauge, Wrench, RefreshCw } from "lucide-react"
import { logInterventionAnalytics } from "@/lib/mock-attestation"

interface InterventionTabsProps {
  tokenId: string
}

const maintenanceTypes = [
  { value: "0", label: "Preventivo - Inspección rutinaria" },
  { value: "1", label: "Correctivo - Reparación de falla" },
  { value: "2", label: "Correctivo - Repintado" },
  { value: "3", label: "Correctivo - Vandalismo" },
  { value: "4", label: "Correctivo - Daño por clima" },
]

export function InterventionTabs({ tokenId }: InterventionTabsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("reading")

  // Reading form state
  const [deliveredKWh, setDeliveredKWh] = useState("")
  const [remainingKWh, setRemainingKWh] = useState("")

  // Maintenance form state
  const [maintenanceKind, setMaintenanceKind] = useState<string>("")
  const [notes, setNotes] = useState("")

  // Replacement form state
  const [oldSerial, setOldSerial] = useState("")
  const [newSerial, setNewSerial] = useState("")

  const handleSubmit = async (type: "READING" | "MAINTENANCE" | "REPLACEMENT") => {
    setIsSubmitting(true)
    const submitStart = Date.now()

    try {
      let data: any = { tokenId, type }

      // Validate and prepare data based on type
      if (type === "READING") {
        const delivered = Number.parseFloat(deliveredKWh)
        const remaining = Number.parseFloat(remainingKWh)

        if (isNaN(delivered) || isNaN(remaining)) {
          toast({
            title: "Error de validación",
            description: "Por favor ingrese valores numéricos válidos",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }

        data = { ...data, deliveredKWh: delivered, remainingKWh: remaining }
      } else if (type === "MAINTENANCE") {
        if (!maintenanceKind) {
          toast({
            title: "Error de validación",
            description: "Por favor seleccione un tipo de mantenimiento",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }

        data = { ...data, maintenanceKind: Number.parseInt(maintenanceKind), notes }
      } else if (type === "REPLACEMENT") {
        if (!oldSerial || !newSerial) {
          toast({
            title: "Error de validación",
            description: "Por favor ingrese ambos números de serie",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }

        data = { ...data, oldSerial, newSerial }
      }

      console.log("[v0] Submitting intervention:", data)

      const response = await fetch("/api/interventions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create intervention")
      }

      const submitDuration = Date.now() - submitStart
      console.log("[v0] Intervention submitted in", submitDuration, "ms")

      // Log analytics
      logInterventionAnalytics(type, tokenId)

      // Show success toast
      toast({
        title: "Evento registrado",
        description: `Attestation UID: ${result.attestationUID.slice(0, 20)}...`,
      })

      // Reset form
      if (type === "READING") {
        setDeliveredKWh("")
        setRemainingKWh("")
      } else if (type === "MAINTENANCE") {
        setMaintenanceKind("")
        setNotes("")
      } else if (type === "REPLACEMENT") {
        setOldSerial("")
        setNewSerial("")
      }

      // Redirect back to pole page after a short delay
      setTimeout(() => {
        router.push(`/p/${tokenId}`)
      }, 1500)
    } catch (error) {
      console.error("[v0] Error submitting intervention:", error)
      toast({
        title: "Error al registrar evento",
        description:
          error instanceof Error ? error.message : "No se pudo conectar con el servidor. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 h-auto">
        <TabsTrigger value="reading" className="flex flex-col gap-1 py-3">
          <Gauge className="h-5 w-5" />
          <span className="text-xs">Lectura</span>
        </TabsTrigger>
        <TabsTrigger value="maintenance" className="flex flex-col gap-1 py-3">
          <Wrench className="h-5 w-5" />
          <span className="text-xs">Mantenimiento</span>
        </TabsTrigger>
        <TabsTrigger value="replacement" className="flex flex-col gap-1 py-3">
          <RefreshCw className="h-5 w-5" />
          <span className="text-xs">Reemplazo</span>
        </TabsTrigger>
      </TabsList>

      {/* Reading Tab */}
      <TabsContent value="reading">
        <Card>
          <CardHeader>
            <CardTitle>Registrar Lectura</CardTitle>
            <CardDescription>Ingrese los valores actuales de consumo del poste</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delivered">Consumo Entregado (kWh)</Label>
              <Input
                id="delivered"
                type="number"
                step="0.01"
                placeholder="12500"
                value={deliveredKWh}
                onChange={(e) => setDeliveredKWh(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remaining">Consumo Restante (kWh)</Label>
              <Input
                id="remaining"
                type="number"
                step="0.01"
                placeholder="3500"
                value={remainingKWh}
                onChange={(e) => setRemainingKWh(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            <Button onClick={() => handleSubmit("READING")} disabled={isSubmitting} className="w-full h-12 text-base">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Registrar Lectura"
              )}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Maintenance Tab */}
      <TabsContent value="maintenance">
        <Card>
          <CardHeader>
            <CardTitle>Registrar Mantenimiento</CardTitle>
            <CardDescription>Documente el trabajo de mantenimiento realizado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maintenance-type">Tipo de Mantenimiento</Label>
              <Select value={maintenanceKind} onValueChange={setMaintenanceKind} disabled={isSubmitting}>
                <SelectTrigger id="maintenance-type">
                  <SelectValue placeholder="Seleccione el tipo" />
                </SelectTrigger>
                <SelectContent>
                  {maintenanceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Describa el trabajo realizado..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isSubmitting}
                rows={4}
              />
            </div>
            <Button
              onClick={() => handleSubmit("MAINTENANCE")}
              disabled={isSubmitting}
              className="w-full h-12 text-base"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Registrar Mantenimiento"
              )}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Replacement Tab */}
      <TabsContent value="replacement">
        <Card>
          <CardHeader>
            <CardTitle>Registrar Reemplazo</CardTitle>
            <CardDescription>Documente el reemplazo de equipo en el poste</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="old-serial">Número de Serie Anterior</Label>
              <Input
                id="old-serial"
                type="text"
                placeholder="SN-00123"
                value={oldSerial}
                onChange={(e) => setOldSerial(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-serial">Número de Serie Nuevo</Label>
              <Input
                id="new-serial"
                type="text"
                placeholder="SN-00456"
                value={newSerial}
                onChange={(e) => setNewSerial(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            <Button
              onClick={() => handleSubmit("REPLACEMENT")}
              disabled={isSubmitting}
              className="w-full h-12 text-base"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Registrar Reemplazo"
              )}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
