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
      console.error("Error reading postes.json from filesystem:", error)
      throw new Error("Failed to load postes data")
    }
  }

  throw new Error("Client-side access not supported")
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

async function readContractPoste(
  tokenId: string,
  metadata?: {
    assetTag?: string
    ubicacion?: string
    imageURI?: string
  },
): Promise<Poste | null> {
  if (typeof window !== "undefined") {
    return null
  }

  const { readPosteFromContract } = await import("./contract-reader.server")
  return readPosteFromContract(tokenId, metadata)
}

export async function getPosteByTokenId(tokenId: string): Promise<PosteWithSource> {
  const postes = await getPostesData()
  const fallbackPoste = postes.find((d) => d.tokenId === tokenId)

  // First, try to read from the blockchain contract using mock metadata for richer display
  console.log(`[mock-service] Attempting to read poste ${tokenId} from contract`)
  const contractPoste = await readContractPoste(tokenId, {
    assetTag: fallbackPoste?.assetTag,
    ubicacion: fallbackPoste?.ubicacion,
    imageURI: fallbackPoste?.imageURI,
  })

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
      source: "mock",
    }
  }

  throw new Error("Poste no encontrado")
}

export async function resolveAssetTag(assetTag: string): Promise<{ tokenId: string }> {
  const hash = hashAssetTag(assetTag)
  console.log("[v0:mock] Asset tag hashed", { assetTag, hash })

  const data = await getPostesData()
  const poste = data.find((d) => d.assetTag === assetTag)
  if (!poste) throw new Error("AssetTag no encontrado")
  return { tokenId: poste.tokenId }
}

export async function getEventsByTokenId(tokenId: string): Promise<PosteEvent[]> {
  const data = await getEventsData(tokenId)
  return data.sort((a, b) => +new Date(b.ts) - +new Date(a.ts))
}
