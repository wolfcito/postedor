import type { Poste, PosteEvent } from "./types"

export async function getPosteByTokenId(tokenId: string): Promise<Poste> {
  const response = await fetch("/mocks/postes.json")
  const data: Poste[] = await response.json()
  const poste = data.find((d) => d.tokenId === tokenId)
  if (!poste) throw new Error("Poste no encontrado")
  return poste
}

export async function resolveAssetTag(assetTag: string): Promise<{ tokenId: string }> {
  const response = await fetch("/mocks/postes.json")
  const data: Poste[] = await response.json()
  const poste = data.find((d) => d.assetTag === assetTag)
  if (!poste) throw new Error("AssetTag no encontrado")
  return { tokenId: poste.tokenId }
}

export async function getEventsByTokenId(tokenId: string): Promise<PosteEvent[]> {
  try {
    const response = await fetch(`/mocks/events-${tokenId}.json`)
    if (!response.ok) return []
    const data: PosteEvent[] = await response.json()
    return data.sort((a, b) => +new Date(b.ts) - +new Date(a.ts))
  } catch {
    return []
  }
}
