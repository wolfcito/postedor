import { Card } from "@/components/ui/card"
import { Activity, Zap, Wrench, FileText, Package } from "lucide-react"
import type { ReportKPIs } from "@/lib/types"

interface ReportKPICardsProps {
  kpis: ReportKPIs
}

export function ReportKPICards({ kpis }: ReportKPICardsProps) {
  const cards = [
    {
      label: "Total Postes",
      value: kpis.totalPoles,
      icon: Zap,
      color: "text-blue-500",
    },
    {
      label: "Total Intervenciones",
      value: kpis.totalInterventions,
      icon: Activity,
      color: "text-purple-500",
    },
    {
      label: "Mantenimientos",
      value: kpis.maintenanceCount,
      icon: Wrench,
      color: "text-amber-500",
    },
    {
      label: "Lecturas",
      value: kpis.readingCount,
      icon: FileText,
      color: "text-green-500",
    },
    {
      label: "Reemplazos",
      value: kpis.replacementCount,
      icon: Package,
      color: "text-red-500",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.label} className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon className={`h-5 w-5 ${card.color}`} />
              <span className="text-2xl font-bold">{card.value}</span>
            </div>
            <p className="text-sm text-muted-foreground">{card.label}</p>
          </Card>
        )
      })}
    </div>
  )
}
