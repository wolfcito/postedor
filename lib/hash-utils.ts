import { keccak256, toUtf8Bytes } from "ethers"

/**
 * Centralized hashing utilities for Postedor
 * Uses keccak256 for consistent on-chain/off-chain compatibility
 */

/**
 * Hash an asset tag to its on-chain representation
 * @param assetTag - Physical asset tag (e.g., "POSTE-MDE-000134")
 * @returns Keccak256 hash as hex string
 */
export function hashAssetTag(assetTag: string): string {
  return keccak256(toUtf8Bytes(assetTag))
}

/**
 * Hash a location string for privacy-preserving storage
 * @param ubicacion - Location string (e.g., "Calle 10 #45-67, Medellín")
 * @returns Keccak256 hash as hex string
 */
export function hashUbicacion(ubicacion: string): string {
  return keccak256(toUtf8Bytes(ubicacion))
}

/**
 * Hash an image URI for content verification
 * @param imageURI - Image URI or IPFS hash
 * @returns Keccak256 hash as hex string
 */
export function hashImageURI(imageURI: string): string {
  return keccak256(toUtf8Bytes(imageURI))
}

/**
 * Verify a hash matches the original value
 * @param value - Original value
 * @param hash - Hash to verify against
 * @returns True if hash matches
 */
export function verifyHash(value: string, hash: string): boolean {
  return keccak256(toUtf8Bytes(value)) === hash
}

/**
 * Generate a mock hash for development (deterministic but not cryptographic)
 * Used for demo purposes when real hashing is not needed
 */
export function mockHash(input: string): string {
  return `0x${input.split("").reduce((acc, char) => acc + char.charCodeAt(0).toString(16).padStart(2, "0"), "")}`
}
