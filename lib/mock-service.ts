import type { Poste, PosteEvent } from "./types"

async function getPostesData(): Promise<Poste[]> {
  const response = await fetch("/mocks/postes.json")
  if (!response.ok) throw new Error("Failed to load postes data")
  return response.json()
}

async function getEventsData(tokenId: string): Promise<PosteEvent[]> {
  try {
    const response = await fetch(`/mocks/events-${tokenId}.json`)
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
  const data = await getPostesData()
  const poste = data.find((d) => d.assetTag === assetTag)
  if (!poste) throw new Error("AssetTag no encontrado")
  return { tokenId: poste.tokenId }
}

export async function getEventsByTokenId(tokenId: string): Promise<PosteEvent[]> {
  const data = await getEventsData(tokenId)
  return data.sort((a, b) => +new Date(b.ts) - +new Date(a.ts))
}
