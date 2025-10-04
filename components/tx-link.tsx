import { ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TxLinkProps {
  hash: string
  href?: string
}

export function TxLink({ hash, href }: TxLinkProps) {
  const shortHash = `${hash.slice(0, 6)}...${hash.slice(-4)}`

  const content = (
    <Badge
      variant="outline"
      className="font-mono text-xs bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-colors"
    >
      <ExternalLink className="w-3 h-3 mr-1.5" />
      {shortHash}
    </Badge>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    )
  }

  return content
}
