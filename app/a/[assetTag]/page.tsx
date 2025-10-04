import { redirect } from "next/navigation"
import { resolveAssetTag } from "@/lib/mock-service"

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ assetTag: string }>
}

export default async function AssetTagPage({ params }: PageProps) {
  const { assetTag } = await params

  try {
    const { tokenId } = await resolveAssetTag(assetTag)
    redirect(`/p/${tokenId}`)
  } catch {
    redirect("/?error=not-found")
  }
}
