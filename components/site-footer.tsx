import Link from "next/link"
import { Zap, Github, Twitter } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-foreground">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Zap className="h-4 w-4" />
              </span>
              <span className="text-base font-semibold">Postedor</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Seguimiento en tiempo real de infraestructura eléctrica con prueba on-chain.
            </p>
            <p className="text-xs text-muted-foreground/70">© {new Date().getFullYear()} Postedor. Todos los derechos reservados.</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Explorar</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link className="transition hover:text-foreground" href="/">
                  Inicio
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-foreground" href="/reports">
                  Reportes
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-foreground" href="/admin/inventory">
                  Inventario
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-foreground" href="/admin/mint">
                  Minteo
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recursos</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link className="transition hover:text-foreground" href="/docs">
                  Documentación
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-foreground" href="/reports">
                  Informes operativos
                </Link>
              </li>
              <li>
                <a
                  className="transition hover:text-foreground"
                  href="mailto:soporte@postedor.app"
                >
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Comunidad</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  className="flex items-center gap-2 transition hover:text-foreground"
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </li>
              <li>
                <a
                  className="flex items-center gap-2 transition hover:text-foreground"
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
