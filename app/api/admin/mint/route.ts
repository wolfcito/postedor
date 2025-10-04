import { type NextRequest, NextResponse } from "next/server"
import { hashAssetTag, hashUbicacion, hashImageURI } from "@/lib/hash-utils"
import { generateMockAttestationUID } from "@/lib/mock-attestation"

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { assetTag, ubicacion, capacidadKW, seguridad, imageURI, consumoEntregado, consumoRestante } = body

    // Validate required fields
    if (!assetTag || !ubicacion || !capacidadKW || seguridad === undefined || !imageURI) {
      return NextResponse.json({ error: "Campos requeridos faltantes", code: "MISSING_FIELDS" }, { status: 400 })
    }

    // Validate ranges
    if (capacidadKW <= 0) {
      return NextResponse.json({ error: "Capacidad debe ser mayor a 0", code: "INVALID_CAPACITY" }, { status: 400 })
    }

    if (seguridad < -10 || seguridad > 10) {
      return NextResponse.json(
        { error: "Seguridad debe estar entre -10 y +10", code: "INVALID_SECURITY" },
        { status: 400 },
      )
    }

    // Load existing poles
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const response = await fetch(`${baseUrl}/mocks/postes.json`, { cache: "no-store" })
    const postes = await response.json()

    // Check for duplicate asset tag
    const duplicate = postes.find((p: any) => p.assetTag === assetTag)
    if (duplicate) {
      console.log(`[v0] [MINT] Duplicate asset tag blocked: ${assetTag}`)
      return NextResponse.json(
        { error: "Asset tag ya existe", code: "DUPLICATE_ASSET_TAG", existingTokenId: duplicate.tokenId },
        { status: 409 },
      )
    }

    // Generate next tokenId
    const maxTokenId = Math.max(...postes.map((p: any) => Number.parseInt(p.tokenId)), 0)
    const newTokenId = (maxTokenId + 1).toString()

    // Hash relevant fields
    const assetTagHash = hashAssetTag(assetTag)
    const ubicacionHash = hashUbicacion(ubicacion)
    const imageURIHash = hashImageURI(imageURI)

    // Generate attestation UID
    const attestationUID = generateMockAttestationUID()

    // Create new pole
    const newPoste = {
      tokenId: newTokenId,
      assetTag,
      ubicacion,
      capacidadKW: Number(capacidadKW),
      consumoEntregado: Number(consumoEntregado) || 0,
      consumoRestante: Number(consumoRestante) || capacidadKW * 1000,
      seguridad: Number(seguridad),
      imageURI,
      lastAttestationUID: attestationUID,
      updatedAt: new Date().toISOString(),
    }

    // In a real app, this would persist to a database
    // For mock, we'll just return the new pole
    console.log(`[v0] [MINT] New pole minted:`, {
      tokenId: newTokenId,
      assetTag,
      assetTagHash,
      ubicacionHash,
      imageURIHash,
      attestationUID,
      duration: Date.now() - startTime,
    })

    return NextResponse.json(
      {
        success: true,
        poste: newPoste,
        hashes: {
          assetTag: assetTagHash,
          ubicacion: ubicacionHash,
          imageURI: imageURIHash,
        },
        attestationUID,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] [MINT] Error:", error)
    return NextResponse.json({ error: "Error al crear poste", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}
