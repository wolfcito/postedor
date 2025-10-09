"use client"

import { useEffect, useMemo, useState } from "react"
import { useGetPoste } from "@/hooks/use-postedor-contract"
import { contractPosteToAppPoste } from "@/lib/contract-utils"
import type { Poste, PosteWithSource } from "@/lib/types"

interface PosteData {
  tokenId: string
  assetTag: string
  ubicacion: string
  capacidadKW: number
  consumoEntregado: number
  consumoRestante: number
  seguridad: number
  lastAttestationUID: string
  imageURI: string
}

interface PosteDataProviderProps {
  tokenId: string
  initialPoste: PosteWithSource
  fallbackPoste?: Poste
  children: (data: { poste: PosteData; isFromContract: boolean; isLoading: boolean }) => React.ReactNode
}

const DEFAULT_ATTESTATION = ""

function toClientPoste(poste: Poste | PosteWithSource): PosteData {
  return {
    tokenId: poste.tokenId,
    assetTag: poste.assetTag ?? `POSTE-${poste.tokenId}`,
    ubicacion: poste.ubicacion,
    capacidadKW: poste.capacidadKW,
    consumoEntregado: poste.consumoEntregado,
    consumoRestante: poste.consumoRestante,
    seguridad: poste.seguridad,
    lastAttestationUID: poste.lastAttestationUID ?? DEFAULT_ATTESTATION,
    imageURI: poste.imageURI,
  }
}

/**
 * Provider component that fetches poste data from contract with fallback to mock data
 */
export function PosteDataProvider({ tokenId, initialPoste, fallbackPoste, children }: PosteDataProviderProps) {
  const fallback = fallbackPoste ?? initialPoste
  const fallbackClient = useMemo(() => toClientPoste(fallback), [fallback])

  const [posteData, setPosteData] = useState<PosteData>(() => toClientPoste(initialPoste))
  const [isFromContract, setIsFromContract] = useState(initialPoste.source === "contract")

  useEffect(() => {
    setPosteData(toClientPoste(initialPoste))
    setIsFromContract(initialPoste.source === "contract")
  }, [initialPoste])

  const metadata = useMemo(
    () => ({
      assetTag: fallback.assetTag,
      ubicacion: fallback.ubicacion,
      imageURI: fallback.imageURI,
    }),
    [fallback],
  )

  const tokenAsBigInt = useMemo(() => {
    try {
      return BigInt(tokenId)
    } catch (error) {
      console.warn("[PosteDataProvider] Invalid tokenId provided", { tokenId, error })
      return undefined
    }
  }, [tokenId])

  const { data: contractData, isLoading, isSuccess, isError } = useGetPoste(tokenAsBigInt)

  useEffect(() => {
    if (!tokenAsBigInt) {
      setPosteData(fallbackClient)
      setIsFromContract(false)
      return
    }

    if (isSuccess && contractData) {
      const convertedData = contractPosteToAppPoste(tokenAsBigInt, contractData, metadata)
      setPosteData(convertedData)
      setIsFromContract(true)
      return
    }

    if (!isLoading && (isError || !contractData)) {
      setPosteData(fallbackClient)
      setIsFromContract(false)
    }
  }, [tokenAsBigInt, contractData, isSuccess, isLoading, isError, metadata, fallbackClient])

  return <>{children({ poste: posteData, isFromContract, isLoading })}</>
}
