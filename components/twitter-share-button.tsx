"use client"

import { Button } from "@/components/ui/button"
import { Twitter } from "lucide-react"

interface TwitterShareButtonProps {
  tokenId: string
  assetTag?: string
  ubicacion?: string
}

export function TwitterShareButton({ tokenId, assetTag, ubicacion }: TwitterShareButtonProps) {
  const handleShare = () => {
    const url = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/p/${tokenId}`
    const text = `Poste #${tokenId}${assetTag ? ` (${assetTag})` : ""}${ubicacion ? ` - ${ubicacion}` : ""}`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`

    window.open(twitterUrl, "_blank", "noopener,noreferrer,width=550,height=420")
  }

  return (
    <Button onClick={handleShare} variant="outline" size="sm" className="gap-2 bg-transparent">
      <Twitter className="h-4 w-4" />
      Compartir
    </Button>
  )
}
