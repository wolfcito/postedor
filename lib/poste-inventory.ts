import "server-only"

import type { Poste, PosteWithSource } from "./types"
import { getPosteByTokenId, listFallbackPostes } from "./mock-service"
import { getNextTokenId, getTokenIdByAssetTag } from "./contract-reader.server"

export interface PosteInventoryEntry {
  assetTag?: string
  fallbackTokenId?: string
  resolvedTokenId: string
  minted: boolean
  source: PosteWithSource["source"]
  discrepancy?: "token-mismatch"
  poste: PosteWithSource
}

function toPosteWithSourceFromFallback(fallback: Poste): PosteWithSource {
  return {
    ...fallback,
    source: "mock",
  }
}

export async function fetchPosteInventory(): Promise<PosteInventoryEntry[]> {
  const inventory: PosteInventoryEntry[] = []
  const seenTokenIds = new Set<string>()

  let fallbackPostes: Awaited<ReturnType<typeof listFallbackPostes>> = []
  try {
    fallbackPostes = await listFallbackPostes()
  } catch (error) {
    console.error("[poste-inventory] Error loading fallback postes:", error)
  }

  for (const fallback of fallbackPostes) {
    const metadata = {
      assetTag: fallback.assetTag,
      ubicacion: fallback.ubicacion,
      imageURI: fallback.imageURI,
    }

    let resolvedTokenId = fallback.tokenId
    let minted = false

    if (fallback.assetTag) {
      try {
        const tokenFromContract = await getTokenIdByAssetTag(fallback.assetTag)
        if (tokenFromContract) {
          resolvedTokenId = tokenFromContract
          minted = true
        }
      } catch (error) {
        console.error("[poste-inventory] Error resolving asset tag on-chain:", error)
      }
    }

    let poste: PosteWithSource
    try {
      poste = await getPosteByTokenId(resolvedTokenId, metadata)
    } catch (error) {
      console.warn("[poste-inventory] Falling back to local data for token", resolvedTokenId, error)
      poste = toPosteWithSourceFromFallback(fallback)
    }

    inventory.push({
      assetTag: fallback.assetTag,
      fallbackTokenId: fallback.tokenId,
      resolvedTokenId,
      minted,
      source: poste.source,
      discrepancy: minted && resolvedTokenId !== fallback.tokenId ? "token-mismatch" : undefined,
      poste,
    })

    seenTokenIds.add(resolvedTokenId)
  }

  let nextTokenId = 1
  try {
    nextTokenId = await getNextTokenId()
  } catch (error) {
    console.error("[poste-inventory] Error getting next token id:", error)
  }

  for (let token = 1; token < nextTokenId; token++) {
    const tokenId = token.toString()
    if (seenTokenIds.has(tokenId)) {
      continue
    }

    try {
      const poste = await getPosteByTokenId(tokenId)
      inventory.push({
        assetTag: poste.assetTag,
        fallbackTokenId: undefined,
        resolvedTokenId: tokenId,
        minted: poste.source === "contract",
        source: poste.source,
        discrepancy: undefined,
        poste,
      })
      seenTokenIds.add(tokenId)
    } catch (error) {
      console.warn("[poste-inventory] Token id not found on-chain or in mocks:", tokenId, error)
    }
  }

  const assetTagCollisions = new Map<string, number>()
  for (const entry of inventory) {
    if (!entry.assetTag) continue
    const current = assetTagCollisions.get(entry.assetTag) ?? 0
    assetTagCollisions.set(entry.assetTag, current + 1)
  }

  for (const entry of inventory) {
    if (!entry.assetTag) continue
    const occurrences = assetTagCollisions.get(entry.assetTag)
    if (occurrences && occurrences > 1) {
      entry.discrepancy = entry.discrepancy ?? "token-mismatch"
    }
  }

  return inventory.sort((a, b) => {
    if (a.assetTag && b.assetTag) {
      return a.assetTag.localeCompare(b.assetTag)
    }
    if (a.assetTag) return -1
    if (b.assetTag) return 1

    return Number(a.resolvedTokenId) - Number(b.resolvedTokenId)
  })
}
