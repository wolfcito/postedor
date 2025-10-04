import type { Poste, PosteEvent } from "./types"

function getBaseUrl() {
  const envUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)

  return envUrl ?? "http://localhost:3000"
}

async function getPostesData(): Promise<Poste[]> {
  const response = await fetch(new URL("/mocks/postes.json", getBaseUrl()), { cache: "no-store" })
  if (!response.ok) throw new Error("Failed to load postes data")
  return response.json()
}

async function getEventsData(tokenId: string): Promise<PosteEvent[]> {
  try {
    const response = await fetch(new URL(`/mocks/events-${tokenId}.json`, getBaseUrl()), { cache: "no-store" })
    if (!response.ok) return []
    return response.json()
  } catch {
    return []
  }
}

export async function getPosteByTokenId(tokenId: string): Promise<Poste> {
  const data = await getPostesData()
  const poste = data.find((d) => d.tokenId === tokenId)
  if (!poste) throw new Error("Poste no encontrado")
  return poste
}

export async function resolveAssetTag(assetTag: string): Promise<{ tokenId: string }> {
  const mockHash = `0x${assetTag.split("").reduce((acc, char) => acc + char.charCodeAt(0).toString(16), "")}`
  console.log("[v0:mock] Asset tag hashed", { assetTag, hash: mockHash })

  const data = await getPostesData()
  const poste = data.find((d) => d.assetTag === assetTag)
  if (!poste) throw new Error("AssetTag no encontrado")
  return { tokenId: poste.tokenId }
}

export async function getEventsByTokenId(tokenId: string): Promise<PosteEvent[]> {
  const data = await getEventsData(tokenId)
  return data.sort((a, b) => +new Date(b.ts) - +new Date(a.ts))
}
