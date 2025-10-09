import type { Poste, PosteEvent } from "./types"
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

export async function getPosteByTokenId(tokenId: string): Promise<Poste> {
  const data = await getPostesData()
  const poste = data.find((d) => d.tokenId === tokenId)
  if (!poste) throw new Error("Poste no encontrado")
  return poste
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
