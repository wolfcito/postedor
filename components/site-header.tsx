import Link from "next/link"
import { Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

const primaryNav = [
  { href: "/", label: "Inicio" },
  { href: "/reports", label: "Reportes" },
  { href: "/admin/inventory", label: "Inventario" },
  { href: "/admin/mint", label: "Minteo" },
]

export function SiteHeader() {
  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-4 md:py-5">
        <Link href="/" className="flex items-center gap-2 text-foreground transition hover:text-primary">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Zap className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Postedor</span>
        </Link>
        <nav className="flex flex-1 items-center justify-end gap-3 text-sm font-medium text-muted-foreground">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 transition hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <Button asChild size="sm" className="hidden md:inline-flex">
            <Link href="/admin/mint">Registrar poste</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
