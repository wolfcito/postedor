import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

const demoPoles = [
  {
    id: "1",
    assetTag: "POSTE-001-000001",
    location: "Av. Principal, Sector Norte",
    status: "Operational",
  },
  {
    id: "2",
    assetTag: "POSTE-001-000002",
    location: "Calle Secundaria, Zona Industrial",
    status: "Maintenance Required",
  },
]

export function DemoSection() {
  return (
    <section id="demo" className="container mx-auto px-4 py-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Prueba el sistema ahora</h2>
          <p className="text-zinc-400 text-lg">
          Explora un poste de demostración para ver cómo funciona el sistema de seguimiento verificado on-chain
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {demoPoles.map((pole) => (
            <a
              key={pole.id}
              href={`/p/${pole.id}`}
              className="group bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-zinc-500 mb-1">Demo Asset</p>
                  <h3 className="text-xl font-semibold group-hover:text-yellow-400 transition-colors">
                    {pole.assetTag}
                  </h3>
                </div>
                <ExternalLink className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Location:</span>
                  <span className="text-zinc-300">{pole.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Status:</span>
                  <span className={pole.status === "Operational" ? "text-green-400" : "text-yellow-400"}>
                    {pole.status}
                  </span>
                </div>
              </div>

              <Button className="w-full mt-4 bg-zinc-800 hover:bg-zinc-700 text-white" asChild>
                <span>View Details</span>
              </Button>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
