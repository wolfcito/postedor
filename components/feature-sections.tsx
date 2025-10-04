import { Shield, Clock, FileText, Users } from "lucide-react"

const features = [
  {
    phase: "Fase 1",
    title: "Registro de Poste",
    icon: Shield,
    items: [
      "Escanea el código QR único del poste",
      "Acceso instantáneo desde dispositivo móvil",
      "Resolución automática de Asset Tag",
      "Navegación directa a ficha del poste",
    ],
  },
  {
    phase: "Fase 2",
    title: "Seguimiento Operativo",
    icon: Clock,
    items: [
      "Registro de intervenciones en tiempo real",
      "Timeline de mantenimientos",
      "Registro de lecturas y consumo",
      "Registro de reemplazos de componentes",
    ],
  },
  {
    phase: "Fase 3",
    title: "Análisis y Reportes",
    icon: FileText,
    items: [
      "Dashboard de KPI a nivel de flota",
      "Análisis de incidentes y tendencias",
      "Exportación de datos para auditorías",
      "Visualización de métricas de rendimiento",
    ],
  },
  {
    phase: "Fase 4",
    title: "Gestión de Equipos",
    icon: Users,
    items: ["Control de acceso para operadores", "Registro de auditoría de actividades", "Permisos basados en roles", "Coordinación multi-equipo"],
  },
]

export function FeaturesSection() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="max-w-4xl mx-auto">

        <div className="space-y-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="flex gap-6">
                {/* Timeline dot and line */}
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-white" />
                  {index < features.length - 1 && <div className="w-0.5 h-full bg-zinc-800 mt-2" />}
                </div>

                {/* Content */}
                <div className="flex-1 pb-12">
                  <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-zinc-500 mb-1">{feature.phase}</p>
                        <h3 className="text-xl font-semibold">{feature.title}</h3>
                      </div>
                      <div className="p-2 bg-zinc-800 rounded-lg">
                        <Icon className="w-5 h-5 text-zinc-400" />
                      </div>
                    </div>

                    <ul className="space-y-2">
                      {feature.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2 text-zinc-400">
                          <span className="text-zinc-600 mt-1">→</span>
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
