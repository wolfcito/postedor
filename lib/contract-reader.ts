import { createPublicClient, http } from "viem"
import { POSTEDOR_ABI, CONTRACT_ADDRESSES } from "./contracts"
import { polkadotAssetHubTestnet } from "./chains"
import type { Poste } from "./types"
import { contractPosteToAppPoste } from "./contract-utils"
import { hashUbicacion, hashImageURI } from "./hash-utils"

type PosteMetadata = {
  assetTag?: string
  ubicacion?: string
  imageURI?: string
}

// Create a public client for reading from the contract
const publicClient = createPublicClient({
  chain: polkadotAssetHubTestnet,
  transport: http(),
})

/**
 * Read poste data from the blockchain contract
 */
export async function readPosteFromContract(tokenId: string, metadata?: PosteMetadata): Promise<Poste | null> {
  try {
    const contractAddress = CONTRACT_ADDRESSES.POSTEDOR
    if (!contractAddress) {
      console.log("[contract-reader] No contract address configured")
      return null
    }

    const tokenAsBigInt = BigInt(tokenId)

    console.log(`[contract-reader] Reading poste ${tokenId} from contract ${contractAddress}`)

    // Check if token exists by trying to get owner
    const owner = await publicClient.readContract({
      address: contractAddress,
      abi: POSTEDOR_ABI,
      functionName: "ownerOf",
      args: [tokenAsBigInt],
    })

    if (!owner) {
      console.log(`[contract-reader] Token ${tokenId} has no owner`)
      return null
    }

    // Get poste data from contract
    const posteData = await publicClient.readContract({
      address: contractAddress,
      abi: POSTEDOR_ABI,
      functionName: "getPoste",
      args: [tokenAsBigInt],
    })

    console.log(`[contract-reader] Raw poste data from contract:`, posteData)

    const normalized = Array.isArray(posteData)
      ? {
          ubicacionHash: posteData[0] as `0x${string}`,
          capacidadKW: Number(posteData[1]),
          consumoEntregado: posteData[2] as bigint,
          consumoRestante: posteData[3] as bigint,
          seguridad: Number(posteData[4]),
          lastAttestationUID: posteData[5] as `0x${string}`,
          imageURIHash: posteData[6] as `0x${string}`,
        }
      : {
          ubicacionHash: posteData.ubicacionHash as `0x${string}`,
          capacidadKW: Number(posteData.capacidadKW),
          consumoEntregado: posteData.consumoEntregado as bigint,
          consumoRestante: posteData.consumoRestante as bigint,
          seguridad: Number(posteData.seguridad),
          lastAttestationUID: posteData.lastAttestationUID as `0x${string}`,
          imageURIHash: posteData.imageURIHash as `0x${string}`,
        }

    const posteFromContract = contractPosteToAppPoste(tokenAsBigInt, posteData as any, metadata)

    const poste: Poste = {
      ...posteFromContract,
      updatedAt: new Date().toISOString(),
    }

    if (metadata?.ubicacion) {
      const expectedUbicacionHash = hashUbicacion(metadata.ubicacion)
      if (expectedUbicacionHash.toLowerCase() !== normalized.ubicacionHash.toLowerCase()) {
        console.warn(
          `[contract-reader] Ubicacion hash mismatch for token ${tokenId}. Expected ${expectedUbicacionHash}, got ${normalized.ubicacionHash}`,
        )
      }
    }

    if (metadata?.imageURI) {
      const expectedImageHash = hashImageURI(metadata.imageURI)
      if (expectedImageHash.toLowerCase() !== normalized.imageURIHash.toLowerCase()) {
        console.warn(
          `[contract-reader] Image hash mismatch for token ${tokenId}. Expected ${expectedImageHash}, got ${normalized.imageURIHash}`,
        )
      }
    }

    console.log(`[contract-reader] Parsed poste data:`, poste)
    return poste
  } catch (error: any) {
    // If token doesn't exist, ownerOf will throw
    if (error.message?.includes("TokenDoesNotExist") || error.message?.includes("NOT_MINTED")) {
      console.log(`[contract-reader] Token ${tokenId} does not exist in contract`)
      return null
    }
    console.error(`[contract-reader] Error reading from contract:`, error)
    return null
  }
}

/**
 * Get the next token ID from the contract
 */
export async function getNextTokenId(): Promise<number> {
  try {
    const contractAddress = CONTRACT_ADDRESSES.POSTEDOR
    if (!contractAddress) {
      return 1
    }

    const nextId = await publicClient.readContract({
      address: contractAddress,
      abi: POSTEDOR_ABI,
      functionName: "nextId",
    })

    return Number(nextId)
  } catch (error) {
    console.error("[contract-reader] Error getting next token ID:", error)
    return 1
  }
}
