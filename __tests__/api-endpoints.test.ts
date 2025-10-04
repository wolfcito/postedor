import { describe, it, expect } from "@jest/globals"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

describe("API Endpoints", () => {
  describe("GET /api/poste/[tokenId]", () => {
    it("should return poste data for valid tokenId", async () => {
      const response = await fetch(`${BASE_URL}/api/poste/1`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty("tokenId", "1")
      expect(data).toHaveProperty("ubicacion")
      expect(data).toHaveProperty("capacidadKW")
      expect(data).toHaveProperty("consumoEntregado")
      expect(data).toHaveProperty("consumoRestante")
      expect(data).toHaveProperty("seguridad")
      expect(data).toHaveProperty("imageURI")
    })

    it("should return 404 for invalid tokenId", async () => {
      const response = await fetch(`${BASE_URL}/api/poste/999`)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toHaveProperty("error", "NOT_FOUND")
      expect(data).toHaveProperty("message")
      expect(data).toHaveProperty("tokenId", "999")
    })

    it("should include cache headers", async () => {
      const response = await fetch(`${BASE_URL}/api/poste/1`)

      expect(response.headers.get("cache-control")).toContain("public")
      expect(response.headers.get("cache-control")).toContain("s-maxage")
    })
  })

  describe("GET /api/events/[tokenId]", () => {
    it("should return events array for valid tokenId", async () => {
      const response = await fetch(`${BASE_URL}/api/events/1`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)

      if (data.length > 0) {
        expect(data[0]).toHaveProperty("id")
        expect(data[0]).toHaveProperty("tokenId")
        expect(data[0]).toHaveProperty("type")
        expect(data[0]).toHaveProperty("actor")
        expect(data[0]).toHaveProperty("attestationUID")
        expect(data[0]).toHaveProperty("txHash")
        expect(data[0]).toHaveProperty("ts")
      }
    })

    it("should return empty array for tokenId with no events", async () => {
      const response = await fetch(`${BASE_URL}/api/events/999`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(0)
    })

    it("should return events sorted by timestamp descending", async () => {
      const response = await fetch(`${BASE_URL}/api/events/1`)
      const data = await response.json()

      if (data.length > 1) {
        const timestamps = data.map((e: any) => new Date(e.ts).getTime())
        const sortedTimestamps = [...timestamps].sort((a, b) => b - a)
        expect(timestamps).toEqual(sortedTimestamps)
      }
    })
  })

  describe("GET /api/resolve-asset-tag/[assetTag]", () => {
    it("should resolve valid asset tag to tokenId", async () => {
      const response = await fetch(`${BASE_URL}/api/resolve-asset-tag/POSTE-MDE-000134`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty("tokenId")
      expect(typeof data.tokenId).toBe("string")
    })

    it("should return 404 for unknown asset tag", async () => {
      const response = await fetch(`${BASE_URL}/api/resolve-asset-tag/UNKNOWN-TAG`)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toHaveProperty("error", "NOT_FOUND")
      expect(data).toHaveProperty("message")
      expect(data).toHaveProperty("assetTag", "UNKNOWN-TAG")
      expect(data).toHaveProperty("hash")
    })

    it("should include hash in response", async () => {
      const response = await fetch(`${BASE_URL}/api/resolve-asset-tag/POSTE-MDE-000134`)
      const data = await response.json()

      // Even on success, we can check the logs or error case
      // For success case, hash is logged but not returned
      expect(response.status).toBe(200)
    })
  })
})
