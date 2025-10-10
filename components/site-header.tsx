import Link from "next/link"
import { Zap, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const primaryNav = [
  { href: "/", label: "Inicio" },
  { href: "/reports", label: "Reportes" },
  { href: "/admin/inventory", label: "Inventario" },
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
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-md px-3 py-2 transition hover:bg-muted hover:text-foreground focus-visible:outline-none">
              Admin
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="min-w-[12rem]">
              <DropdownMenuItem asChild>
                <Link href="/admin/mint">Registrar poste</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/contract-operators">Agregar operadores</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  )
}
