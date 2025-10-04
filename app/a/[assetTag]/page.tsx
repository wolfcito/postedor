import { redirect } from "next/navigation"
import { resolveAssetTag } from "@/lib/mock-service"

interface PageProps {
  params: Promise<{ assetTag: string }>
}

export async function generateStaticParams() {
  return [{ assetTag: "POSTE-001" }, { assetTag: "POSTE-002" }]
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
