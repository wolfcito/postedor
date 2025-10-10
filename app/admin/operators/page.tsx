"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Search, UserCheck, UserX, Trash2, Users } from "lucide-react"
import { AddOperatorDialog } from "@/components/add-operator-dialog"
import { OperatorActivityFeed } from "@/components/operator-activity-feed"
import { useToast } from "@/hooks/use-toast"
import type { Operator, OperatorStatus } from "@/lib/types"

export default function OperatorsPage() {
  const [operators, setOperators] = useState<Operator[]>([])
  const [filteredOperators, setFilteredOperators] = useState<Operator[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | OperatorStatus>("all")
  const [operatorToDelete, setOperatorToDelete] = useState<Operator | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchOperators()
  }, [])

  useEffect(() => {
    filterOperators()
  }, [operators, searchQuery, statusFilter])

  const fetchOperators = async () => {
    const startTime = Date.now()
    try {
      const response = await fetch("/api/admin/operators")
      if (!response.ok) throw new Error("Failed to fetch operators")
      const data = await response.json()
      setOperators(data)
      console.log(`[v0] [M2-S3] Loaded ${data.length} operators in ${Date.now() - startTime}ms`)
    } catch (error) {
      console.error("[v0] Error fetching operators:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los operadores",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterOperators = () => {
    let filtered = operators

    if (statusFilter !== "all") {
      filtered = filtered.filter((op) => op.status === statusFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (op) =>
          op.name.toLowerCase().includes(query) ||
          op.email.toLowerCase().includes(query) ||
          op.address.toLowerCase().includes(query),
      )
    }

    setFilteredOperators(filtered)
  }

  const handleAddOperator = (newOperator: Operator) => {
    // Optimistic UI update
    setOperators((prev) => [newOperator, ...prev])
    toast({
      title: "Operador agregado",
      description: `${newOperator.name} ha sido agregado exitosamente`,
    })
    console.log(`[v0] [M2-S3] [ANALYTICS] Operator added: ${newOperator.role}`)
  }

  const handleToggleStatus = async (operator: Operator) => {
    const newStatus: OperatorStatus = operator.status === "active" ? "inactive" : "active"

    // Optimistic UI update
    setOperators((prev) => prev.map((op) => (op.id === operator.id ? { ...op, status: newStatus } : op)))

    try {
      const response = await fetch("/api/admin/operators", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operatorId: operator.id, status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update status")

      toast({
        title: newStatus === "active" ? "Operador activado" : "Operador desactivado",
        description: `${operator.name} ha sido ${newStatus === "active" ? "activado" : "desactivado"}`,
      })
      console.log(`[v0] [M2-S3] [ANALYTICS] Operator status changed: ${operator.id} -> ${newStatus}`)
    } catch (error) {
      // Revert on error
      setOperators((prev) => prev.map((op) => (op.id === operator.id ? { ...op, status: operator.status } : op)))
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del operador",
        variant: "destructive",
      })
    }
  }

  const handleDeleteOperator = async () => {
    if (!operatorToDelete) return

    // Optimistic UI update
    setOperators((prev) => prev.filter((op) => op.id !== operatorToDelete.id))
    setOperatorToDelete(null)

    try {
      const response = await fetch(`/api/admin/operators?id=${operatorToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete operator")

      toast({
        title: "Operador removido",
        description: `${operatorToDelete.name} ha sido removido del sistema`,
      })
      console.log(`[v0] [M2-S3] [ANALYTICS] Operator removed: ${operatorToDelete.id}`)
    } catch (error) {
      // Revert on error
      setOperators((prev) => [...prev, operatorToDelete])
      toast({
        title: "Error",
        description: "No se pudo remover el operador",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="page-shell max-w-7xl py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell max-w-7xl space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Operadores</h1>
          <p className="text-muted-foreground mt-1">Administra permisos y accesos del equipo</p>
        </div>
        <AddOperatorDialog onAdd={handleAddOperator} />
      </div>

      {operators.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No hay operadores</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Comienza agregando tu primer operador para gestionar permisos y accesos al sistema.
            </p>
            <AddOperatorDialog onAdd={handleAddOperator} />
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Operadores Activos</CardTitle>
              <CardDescription>
                Los roles on-chain se implementarán en futuras versiones. Actualmente en modo mock.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, email o dirección..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as "all" | OperatorStatus)}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="inactive">Inactivos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                {filteredOperators.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No se encontraron operadores</p>
                ) : (
                  filteredOperators.map((operator) => (
                    <Card key={operator.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">{operator.name}</h3>
                              <Badge variant={operator.status === "active" ? "default" : "secondary"}>
                                {operator.status === "active" ? "Activo" : "Inactivo"}
                              </Badge>
                              <Badge variant="outline">{operator.role}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>{operator.email}</p>
                              <p className="font-mono text-xs">{operator.address}</p>
                              <p className="text-xs">
                                Agregado el {new Date(operator.addedAt).toLocaleDateString("es-CO")} por{" "}
                                {operator.addedBy}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleToggleStatus(operator)}
                              title={operator.status === "active" ? "Desactivar operador" : "Activar operador"}
                            >
                              {operator.status === "active" ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setOperatorToDelete(operator)}
                              title="Remover operador"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <OperatorActivityFeed />
        </>
      )}

      <AlertDialog open={!!operatorToDelete} onOpenChange={(open) => !open && setOperatorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Remover operador?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción removerá a {operatorToDelete?.name} del sistema. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOperator}>Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
