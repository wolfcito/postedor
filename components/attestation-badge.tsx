import { FileCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AttestationBadgeProps {
  uid: string
  href?: string
}

export function AttestationBadge({ uid, href }: AttestationBadgeProps) {
  const shortUid = `${uid.slice(0, 6)}...${uid.slice(-4)}`

  const content = (
    <Badge
      variant="outline"
      className="font-mono text-xs bg-info/5 text-info border-info/20 hover:bg-info/10 transition-colors"
    >
      <FileCheck className="w-3 h-3 mr-1.5" />
      {shortUid}
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
