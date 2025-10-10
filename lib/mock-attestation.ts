import { randomBytes } from "crypto"

/**
 * Generates a mock attestation UID inspired by el formato de Polkadot Asset Hub / EAS
 * Formato: 0x + 64 caracteres hexadecimales
 */
export function generateMockAttestationUID(): string {
  const bytes = randomBytes(32)
  return "0xuid" + bytes.toString("hex").slice(0, 60)
}

/**
 * Generates a mock transaction hash
 * Format: 0x + 64 hex characters
 */
export function generateMockTxHash(): string {
  const bytes = randomBytes(32)
  return "0xtx" + bytes.toString("hex").slice(0, 62)
}

/**
 * Generates a mock actor address
 * Format: operador:0x + 40 hex characters
 */
export function generateMockActor(): string {
  const bytes = randomBytes(20)
  return "operador:0x" + bytes.toString("hex")
}

/**
 * Logs intervention analytics
 */
export function logInterventionAnalytics(type: string, tokenId: string) {
  const timestamp = new Date().toISOString()
  console.log("[v0] Analytics: Intervention recorded", {
    type,
    tokenId,
    timestamp,
  })
}
