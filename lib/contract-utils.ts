import { keccak256, toBytes } from "viem"

/**
 * Hash a string using keccak256
 */
export function hashString(value: string): `0x${string}` {
  return keccak256(toBytes(value))
}

/**
 * Hash contract data fields
 */
export function hashContractData(data: {
  assetTag?: string
  ubicacion?: string
  imageURI?: string
}) {
  return {
    assetTagHash: data.assetTag ? hashString(data.assetTag) : undefined,
    ubicacionHash: data.ubicacion ? hashString(data.ubicacion) : undefined,
    imageURIHash: data.imageURI ? hashString(data.imageURI) : undefined,
  }
}

/**
 * Convert poste data from contract format to app format
 */
export function contractPosteToAppPoste(
  tokenId: bigint,
  contractData: readonly [
    `0x${string}`, // ubicacionHash
    number,        // capacidadKW
    bigint,        // consumoEntregado
    bigint,        // consumoRestante
    number,        // seguridad
    `0x${string}`, // lastAttestationUID
    `0x${string}`  // imageURIHash
  ] | {
    ubicacionHash: `0x${string}`
    capacidadKW: number
    consumoEntregado: bigint
    consumoRestante: bigint
    seguridad: number
    lastAttestationUID: `0x${string}`
    imageURIHash: `0x${string}`
  },
  metadata?: {
    assetTag?: string
    ubicacion?: string
    imageURI?: string
  }
) {
  // Handle both tuple and object formats
  const data = Array.isArray(contractData)
    ? {
        ubicacionHash: contractData[0],
        capacidadKW: contractData[1],
        consumoEntregado: contractData[2],
        consumoRestante: contractData[3],
        seguridad: contractData[4],
        lastAttestationUID: contractData[5],
        imageURIHash: contractData[6]
      }
    : contractData

  return {
    tokenId: tokenId.toString(),
    assetTag: metadata?.assetTag || `POSTE-${tokenId}`,
    ubicacion: metadata?.ubicacion || "Ubicación desde blockchain",
    capacidadKW: data.capacidadKW,
    consumoEntregado: Number(data.consumoEntregado),
    consumoRestante: Number(data.consumoRestante),
    seguridad: data.seguridad,
    lastAttestationUID: data.lastAttestationUID,
    imageURI: metadata?.imageURI || "/placeholder.svg?height=400&width=400",
  }
}

/**
 * Generate a mock attestation UID (32 bytes hex)
 */
export function generateAttestationUID(): `0x${string}` {
  const randomBytes = new Uint8Array(32)
  crypto.getRandomValues(randomBytes)
  return `0x${Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}` as `0x${string}`
}
