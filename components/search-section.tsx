"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SearchSection() {
  const [assetTag, setAssetTag] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (assetTag.trim()) {
      router.push(`/a/${assetTag.trim()}`)
    }
  }

  return (
    <section id="search" className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-zinc-800 rounded-lg">
              <Search className="w-5 h-5 text-zinc-400" />
            </div>
            <h2 className="text-2xl font-semibold">Buscar por Postedor</h2>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter Asset Tag (e.g., POSTE-001-000001)"
                value={assetTag}
                onChange={(e) => setAssetTag(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-12 pr-12"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            </div>

            <Button type="submit" className="w-full h-12 bg-white text-black hover:bg-zinc-200">
              Search Asset
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-800">
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <QrCode className="w-5 h-5" />
              <p>Escanea el código QR en cualquier poste eléctrico para acceder a su historial completo.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
