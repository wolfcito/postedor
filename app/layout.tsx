import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/providers"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import "./globals.css"

export const metadata: Metadata = {
  title: "Postedor - Sistema de Seguimiento de Infraestructura",
  description: "Sistema de seguimiento y gestión de postes eléctricos con historial de operaciones",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Providers>
          <div className="relative flex min-h-screen flex-col bg-background text-foreground">
            <SiteHeader />
            <main className="flex-1">
              <Suspense fallback={null}>{children}</Suspense>
            </main>
            <SiteFooter />
          </div>
          <Toaster />
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}
