import type { Poste, PosteEvent, PosteWithSource } from "./types"
import { hashAssetTag } from "./hash-utils"

async function getPostesData(): Promise<Poste[]> {
  // En servidor, usar filesystem para evitar fetch a localhost durante build
  if (typeof window === "undefined") {
    try {
      const fs = await import("fs/promises")
      const path = await import("path")
      const filePath = path.join(process.cwd(), "public", "mocks", "postes.json")
      const fileContent = await fs.readFile(filePath, "utf-8")
      return JSON.parse(fileContent)
    } catch (error) {
      console.warn("Error reading postes.json from filesystem, returning empty dataset:", error)
      const dataUrl = process.env.POSTEDOR_POSTES_DATA_URL ?? process.env.NEXT_PUBLIC_POSTES_DATA_URL
      if (dataUrl) {
        try {
          const response = await fetch(dataUrl, { cache: "no-store" })
          if (response.ok) {
            return response.json()
          }
        } catch (remoteError) {
          console.warn("Error fetching postes data from remote URL:", remoteError)
        }
      }
      return []
    }
  }

  throw new Error("Client-side access not supported")
}

export async function listFallbackPostes(): Promise<Poste[]> {
  return getPostesData()
}

async function getEventsData(tokenId: string): Promise<PosteEvent[]> {
  // En servidor, usar filesystem para evitar fetch a localhost durante build
  if (typeof window === "undefined") {
    try {
      const fs = await import("fs/promises")
      const path = await import("path")
      const filePath = path.join(process.cwd(), "public", "mocks", `events-${tokenId}.json`)
      const fileContent = await fs.readFile(filePath, "utf-8")
      return JSON.parse(fileContent)
    } catch {
      return []
    }
  }

  return []
}

type PosteMetadataInput = {
  assetTag?: string
  ubicacion?: string
  imageURI?: string
}

async function readContractPoste(tokenId: string, metadata?: PosteMetadataInput, options?: { blockNumber?: bigint }) {
  if (typeof window !== "undefined") {
    return null
  }

  const { readPosteFromContract } = await import("./contract-reader.server")
  return readPosteFromContract(tokenId, metadata, options)
}

function mergeMetadata(primary?: PosteMetadataInput, fallback?: PosteMetadataInput): PosteMetadataInput {
  return {
    assetTag: primary?.assetTag ?? fallback?.assetTag,
    ubicacion: primary?.ubicacion ?? fallback?.ubicacion,
    imageURI: primary?.imageURI ?? fallback?.imageURI,
  }
}

export async function getPosteByTokenId(tokenId: string, metadata?: PosteMetadataInput): Promise<PosteWithSource> {
  const postes = await getPostesData()
  const fallbackPoste = postes.find((d) => d.tokenId === tokenId)
  const mergedMetadata = mergeMetadata(metadata, fallbackPoste)

  // First, try to read from the blockchain contract using mock metadata for richer display
  console.log(`[mock-service] Attempting to read poste ${tokenId} from contract`)
  const contractPoste = await readContractPoste(tokenId, mergedMetadata)

  if (contractPoste) {
    console.log(`[mock-service] Found poste ${tokenId} in contract`)
    const result: PosteWithSource = {
      ...contractPoste,
      source: "contract",
      fallback: fallbackPoste,
    }
    return result
  }

  // Fallback to JSON mock data
  console.log(`[mock-service] Poste ${tokenId} not in contract, checking mock data`)
  if (fallbackPoste) {
    console.log(`[mock-service] Found poste ${tokenId} in mock data`)
    return {
      ...fallbackPoste,
      ...mergedMetadata,
      source: "mock",
    }
  }

  throw new Error("Poste no encontrado")
}

export async function resolveAssetTag(assetTag: string): Promise<{ tokenId: string }> {
  const normalized = assetTag.trim()
  const hash = hashAssetTag(normalized)
  console.log("[v0:mock] Asset tag hashed", { assetTag: normalized, hash })

  if (typeof window === "undefined") {
    try {
      const { getTokenIdByAssetTag } = await import("./contract-reader.server")
      const tokenFromContract = await getTokenIdByAssetTag(normalized)
      if (tokenFromContract) {
        console.log("[mock-service] Asset tag resolved from contract", { assetTag: normalized, tokenId: tokenFromContract })
        return { tokenId: tokenFromContract }
      }
    } catch (error) {
      console.error("[mock-service] Error resolving asset tag from contract:", error)
    }
  }

  const data = await getPostesData()
  const posteByAssetTag = data.find((d) => d.assetTag === normalized)
  if (posteByAssetTag) {
    return { tokenId: posteByAssetTag.tokenId }
  }

  const posteByTokenId = data.find((d) => d.tokenId === normalized)
  if (posteByTokenId) {
    return { tokenId: posteByTokenId.tokenId }
  }

  throw new Error("AssetTag no encontrado")
}

export async function getEventsByTokenId(tokenId: string, metadata?: PosteMetadataInput): Promise<PosteEvent[]> {
  let contractEvents: PosteEvent[] = []

  if (typeof window === "undefined") {
    try {
      const { getPosteSnapshotsFromContract } = await import("./contract-reader.server")
      const snapshots = await getPosteSnapshotsFromContract(tokenId, metadata)

      if (snapshots.length > 0) {
        console.log("[mock-service] Loaded events from contract", {
          tokenId,
          count: snapshots.length,
        })

        const seenIds = new Set<string>()
        contractEvents = snapshots.map((snapshot) => {
          const id = `${snapshot.transactionHash}-${snapshot.logIndex}`
          if (seenIds.has(id)) {
            return null
          }
          seenIds.add(id)
          return {
            id,
            tokenId: snapshot.tokenId,
            type: "READING",
            actor: snapshot.actor ?? "Operador desconocido",
            attestationUID: snapshot.poste.lastAttestationUID ?? "",
            txHash: snapshot.transactionHash,
            ts: snapshot.timestamp,
            deliveredKWh: snapshot.poste.consumoEntregado,
            remainingKWh: snapshot.poste.consumoRestante,
          } satisfies PosteEvent
        }).filter((event): event is PosteEvent => Boolean(event))
      }
    } catch (error) {
      console.error("[mock-service] Error loading events from contract:", error)
    }
  }

  const data = await getEventsData(tokenId)
  const sortedFallback = data.sort((a, b) => +new Date(b.ts) - +new Date(a.ts))

  if (contractEvents.length === 0) {
    return sortedFallback
  }

  const knownIds = new Set(contractEvents.map((event) => event.id))
  const merged = [...contractEvents, ...sortedFallback.filter((event) => !knownIds.has(event.id))]

  return merged.sort((a, b) => +new Date(b.ts) - +new Date(a.ts))
}
