import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: number | string
  unit?: string
  icon?: LucideIcon
  trend?: "up" | "down" | "neutral"
}

export function StatCard({ label, value, unit, icon: Icon, trend }: StatCardProps) {
  const getTrendColor = () => {
    if (trend === "up") return "text-success"
    if (trend === "down") return "text-destructive"
    return "text-muted-foreground"
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-balance">
              {typeof value === "number" ? value.toLocaleString("es-CO") : value}
            </p>
            {unit && <span className="text-lg text-muted-foreground font-medium">{unit}</span>}
          </div>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl bg-primary/10 ${getTrendColor()}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </Card>
  )
}
