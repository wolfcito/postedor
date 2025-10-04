import { describe, it, expect } from "@jest/globals"
import { hashAssetTag, hashUbicacion, hashImageURI, verifyHash, mockHash } from "@/lib/hash-utils"

describe("Hash Utilities", () => {
  describe("hashAssetTag", () => {
    it("should hash asset tags consistently", () => {
      const assetTag = "POSTE-MDE-000134"
      const hash1 = hashAssetTag(assetTag)
      const hash2 = hashAssetTag(assetTag)

      expect(hash1).toBe(hash2)
      expect(hash1).toMatch(/^0x[a-f0-9]{64}$/)
    })

    it("should produce different hashes for different tags", () => {
      const hash1 = hashAssetTag("POSTE-MDE-000134")
      const hash2 = hashAssetTag("POSTE-MDE-000135")

      expect(hash1).not.toBe(hash2)
    })
  })

  describe("hashUbicacion", () => {
    it("should hash locations consistently", () => {
      const ubicacion = "Calle 10 #45-67, Medellín"
      const hash1 = hashUbicacion(ubicacion)
      const hash2 = hashUbicacion(ubicacion)

      expect(hash1).toBe(hash2)
      expect(hash1).toMatch(/^0x[a-f0-9]{64}$/)
    })
  })

  describe("hashImageURI", () => {
    it("should hash image URIs consistently", () => {
      const imageURI = "ipfs://QmXyz123..."
      const hash1 = hashImageURI(imageURI)
      const hash2 = hashImageURI(imageURI)

      expect(hash1).toBe(hash2)
      expect(hash1).toMatch(/^0x[a-f0-9]{64}$/)
    })
  })

  describe("verifyHash", () => {
    it("should verify correct hashes", () => {
      const value = "POSTE-MDE-000134"
      const hash = hashAssetTag(value)

      expect(verifyHash(value, hash)).toBe(true)
    })

    it("should reject incorrect hashes", () => {
      const value = "POSTE-MDE-000134"
      const wrongHash = hashAssetTag("POSTE-MDE-000135")

      expect(verifyHash(value, wrongHash)).toBe(false)
    })
  })

  describe("mockHash", () => {
    it("should generate deterministic mock hashes", () => {
      const input = "test"
      const hash1 = mockHash(input)
      const hash2 = mockHash(input)

      expect(hash1).toBe(hash2)
      expect(hash1).toMatch(/^0x[a-f0-9]+$/)
    })

    it("should produce different hashes for different inputs", () => {
      const hash1 = mockHash("test1")
      const hash2 = mockHash("test2")

      expect(hash1).not.toBe(hash2)
    })
  })
})
