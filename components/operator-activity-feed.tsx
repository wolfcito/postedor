"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserPlus, UserMinus, UserCheck, UserX, Clock } from "lucide-react"
import type { OperatorActivity } from "@/lib/types"

const actionIcons = {
  added: UserPlus,
  removed: UserMinus,
  activated: UserCheck,
  deactivated: UserX,
  updated: Clock,
}

const actionColors = {
  added: "bg-green-500/10 text-green-500",
  removed: "bg-red-500/10 text-red-500",
  activated: "bg-blue-500/10 text-blue-500",
  deactivated: "bg-amber-500/10 text-amber-500",
  updated: "bg-purple-500/10 text-purple-500",
}

const actionLabels = {
  added: "Agregado",
  removed: "Removido",
  activated: "Activado",
  deactivated: "Desactivado",
  updated: "Actualizado",
}

export function OperatorActivityFeed() {
  const [activities, setActivities] = useState<OperatorActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/admin/operators/activity")
      if (!response.ok) throw new Error("Failed to fetch activities")
      const data = await response.json()
      setActivities(
        data.sort(
          (a: OperatorActivity, b: OperatorActivity) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        ),
      )
    } catch (error) {
      console.error("[v0] Error fetching activities:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Cargando historial...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
        <CardDescription>Historial de cambios en operadores</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No hay actividad registrada</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = actionIcons[activity.action]
              return (
                <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                  <div className={`p-2 rounded-lg ${actionColors[activity.action]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{activity.operatorName}</p>
                      <Badge variant="outline" className="text-xs">
                        {actionLabels[activity.action]}
                      </Badge>
                    </div>
                    {activity.details && <p className="text-sm text-muted-foreground">{activity.details}</p>}
                    <p className="text-xs text-muted-foreground">
                      Por {activity.actor} •{" "}
                      {new Date(activity.timestamp).toLocaleString("es-CO", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
