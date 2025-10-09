import { createPublicClient, http } from "viem"
import { POSTEDOR_ABI, CONTRACT_ADDRESSES } from "./contracts"
import { polkadotAssetHubTestnet } from "./chains"
import type { Poste } from "./types"
import { contractPosteToAppPoste } from "./contract-utils"
import { hashUbicacion, hashImageURI, hashAssetTag } from "./hash-utils"

type PosteMetadata = {
  assetTag?: string
  ubicacion?: string
  imageURI?: string
}

type ReadPosteOptions = {
  blockNumber?: bigint
}

export interface PosteSnapshot {
  poste: Poste
  tokenId: string
  blockNumber: bigint
  transactionHash: `0x${string}`
  logIndex: number
  actor?: `0x${string}`
  timestamp: string
}

// Create a public client for reading from the contract
const publicClient = createPublicClient({
  chain: polkadotAssetHubTestnet,
  transport: http(),
})

/**
 * Read poste data from the blockchain contract
 */
export async function readPosteFromContract(
  tokenId: string,
  metadata?: PosteMetadata,
  options?: ReadPosteOptions,
): Promise<Poste | null> {
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
      blockNumber: options?.blockNumber,
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
      blockNumber: options?.blockNumber,
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

export async function getTokenIdByAssetTag(assetTag: string): Promise<string | null> {
  try {
    const hash = hashAssetTag(assetTag) as `0x${string}`
    return getTokenIdByAssetTagHash(hash)
  } catch (error) {
    console.error("[contract-reader] Error hashing asset tag:", error)
    return null
  }
}

export async function getTokenIdByAssetTagHash(assetTagHash: `0x${string}`): Promise<string | null> {
  const contractAddress = CONTRACT_ADDRESSES.POSTEDOR
  if (!contractAddress) {
    console.warn("[contract-reader] No contract address configured for asset tag lookup")
    return null
  }

  try {
    const tokenId = await publicClient.readContract({
      address: contractAddress,
      abi: POSTEDOR_ABI,
      functionName: "byAssetTagHash",
      args: [assetTagHash],
    })

    const tokenAsBigInt = BigInt(tokenId)
    if (tokenAsBigInt === 0n) {
      return null
    }

    return tokenAsBigInt.toString()
  } catch (error) {
    console.error("[contract-reader] Error resolving asset tag hash:", error)
    return null
  }
}

type SnapshotOptions = {
  fromBlock?: bigint
  toBlock?: bigint
}

export async function getPosteSnapshotsFromContract(
  tokenId: string,
  metadata?: PosteMetadata,
  options?: SnapshotOptions,
): Promise<PosteSnapshot[]> {
  const contractAddress = CONTRACT_ADDRESSES.POSTEDOR
  if (!contractAddress) {
    console.warn("[contract-reader] No contract address configured for poste snapshots")
    return []
  }

  let tokenAsBigInt: bigint
  try {
    tokenAsBigInt = BigInt(tokenId)
  } catch (error) {
    console.error("[contract-reader] Invalid token id for snapshots:", { tokenId, error })
    return []
  }

  const fromBlock = options?.fromBlock ?? 0n
  const toBlock = options?.toBlock ?? ("latest" as const)

  let logs: Array<{
    blockNumber?: bigint
    transactionHash?: `0x${string}`
    logIndex?: number
  }>

  try {
    logs = await publicClient.getLogs({
      address: contractAddress,
      abi: POSTEDOR_ABI,
      eventName: "MetadataUpdate",
      args: { _tokenId: tokenAsBigInt },
      fromBlock,
      toBlock,
    })
  } catch (error) {
    console.error("[contract-reader] Error fetching MetadataUpdate logs:", error)
    return []
  }

  const snapshots: PosteSnapshot[] = []

  for (const log of logs) {
    if (!log.blockNumber || !log.transactionHash) {
      continue
    }

    try {
      const [block, receipt, poste] = await Promise.all([
        publicClient.getBlock({ blockNumber: log.blockNumber }),
        publicClient.getTransactionReceipt({ hash: log.transactionHash }),
        readPosteFromContract(tokenId, metadata, { blockNumber: log.blockNumber }),
      ])

      if (!poste) {
        continue
      }

      const timestamp = new Date(Number(block.timestamp) * 1000).toISOString()

      const enrichedPoste: Poste = {
        ...poste,
        updatedAt: timestamp,
      }

      snapshots.push({
        poste: enrichedPoste,
        tokenId: tokenAsBigInt.toString(),
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
        logIndex: log.logIndex ?? 0,
        actor: receipt?.from,
        timestamp,
      })
    } catch (error) {
      console.error("[contract-reader] Error processing metadata log:", error)
    }
  }

  return snapshots.sort((a, b) => {
    if (a.blockNumber === b.blockNumber) {
      return b.logIndex - a.logIndex
    }
    return b.blockNumber > a.blockNumber ? 1 : -1
  })
}
