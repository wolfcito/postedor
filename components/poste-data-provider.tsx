"use client"

import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { useGetPoste } from "@/hooks/use-postedor-contract"
import { contractPosteToAppPoste } from "@/lib/contract-utils"

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
  mockData: PosteData
  children: (data: { poste: PosteData; isFromContract: boolean; isLoading: boolean }) => React.ReactNode
}

/**
 * Provider component that fetches poste data from contract with fallback to mock data
 */
export function PosteDataProvider({ tokenId, mockData, children }: PosteDataProviderProps) {
  const { isConnected } = useAccount()
  const [posteData, setPosteData] = useState<PosteData>(mockData)
  const [isFromContract, setIsFromContract] = useState(false)

  const {
    data: contractData,
    isLoading,
    isSuccess,
  } = useGetPoste(isConnected ? BigInt(tokenId) : undefined)

  useEffect(() => {
    if (isSuccess && contractData && isConnected) {
      // Convert contract data to app format
      const convertedData = contractPosteToAppPoste(BigInt(tokenId), contractData, {
        assetTag: mockData.assetTag, // Keep original metadata
        ubicacion: mockData.ubicacion,
        imageURI: mockData.imageURI,
      })
      setPosteData(convertedData)
      setIsFromContract(true)
    } else {
      // Use mock data when not connected or no contract data
      setPosteData(mockData)
      setIsFromContract(false)
    }
  }, [contractData, isSuccess, isConnected, tokenId, mockData])

  return <>{children({ poste: posteData, isFromContract, isLoading: isConnected && isLoading })}</>
}
