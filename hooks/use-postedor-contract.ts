"use client"

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { CONTRACTS } from "@/lib/contracts"

/**
 * Hook for reading poste data from the contract
 */
export function useGetPoste(tokenId?: bigint) {
  return useReadContract({
    ...CONTRACTS.postedor,
    functionName: "getPoste",
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: tokenId !== undefined,
    },
  })
}

/**
 * Hook for getting owner of a token
 */
export function useOwnerOf(tokenId?: bigint) {
  return useReadContract({
    ...CONTRACTS.postedor,
    functionName: "ownerOf",
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: tokenId !== undefined,
    },
  })
}

/**
 * Hook for getting balance of an address
 */
export function useBalanceOf(address?: `0x${string}`) {
  return useReadContract({
    ...CONTRACTS.postedor,
    functionName: "balanceOf",
    args: address !== undefined ? [address] : undefined,
    query: {
      enabled: address !== undefined,
    },
  })
}

/**
 * Hook for minting new poste tokens
 */
export function useMintPoste() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const mintPoste = (
    to: `0x${string}`,
    assetTagHash: `0x${string}`,
    ubicacionHash: `0x${string}`,
    capacidadKW: number,
    seguridad: number,
    imageURIHash: `0x${string}`
  ) => {
    console.log("[v0] [MINT] Calling contract with:", {
      to,
      assetTagHash,
      ubicacionHash,
      capacidadKW,
      seguridad,
      imageURIHash,
    })

    writeContract({
      ...CONTRACTS.postedor,
      functionName: "mintPoste",
      args: [
        to,
        assetTagHash,
        ubicacionHash,
        capacidadKW as any, // Cast to uint32
        seguridad as any, // Cast to int8
        imageURIHash,
      ],
    })
  }

  return {
    mintPoste,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

/**
 * Hook for recording maintenance
 */
export function useRecordMaintenance() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const recordMaintenance = (tokenId: bigint, maintenanceType: number, attestationUID: `0x${string}`) => {
    writeContract({
      ...CONTRACTS.postedor,
      functionName: "recordMaintenance",
      args: [tokenId, maintenanceType, attestationUID],
    })
  }

  return {
    recordMaintenance,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

/**
 * Hook for recording replacement
 */
export function useRecordReplacement() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const recordReplacement = (
    tokenId: bigint,
    oldPartHash: `0x${string}`,
    newPartHash: `0x${string}`,
    attestationUID: `0x${string}`
  ) => {
    writeContract({
      ...CONTRACTS.postedor,
      functionName: "recordReplacement",
      args: [tokenId, oldPartHash, newPartHash, attestationUID],
    })
  }

  return {
    recordReplacement,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

/**
 * Hook for setting reading (consumo)
 */
export function useSetReading() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const setReading = (
    tokenId: bigint,
    deliveredKWh: bigint,
    remainingKWh: bigint,
    attestationUID: `0x${string}`
  ) => {
    writeContract({
      ...CONTRACTS.postedor,
      functionName: "setReading",
      args: [tokenId, deliveredKWh, remainingKWh, attestationUID],
    })
  }

  return {
    setReading,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

/**
 * Hook for setting operator status
 */
export function useSetOperator() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const setOperator = (account: `0x${string}`, enabled: boolean) => {
    writeContract({
      ...CONTRACTS.postedor,
      functionName: "setOperator",
      args: [account, enabled],
    })
  }

  return {
    setOperator,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  }
}

/**
 * Combined hook for all contract interactions
 */
export function usePostedorContract(tokenId?: bigint) {
  const poste = useGetPoste(tokenId)
  const owner = useOwnerOf(tokenId)
  const mint = useMintPoste()
  const maintenance = useRecordMaintenance()
  const replacement = useRecordReplacement()
  const reading = useSetReading()
  const operator = useSetOperator()

  return {
    // Read operations
    poste: poste.data,
    owner: owner.data,
    isLoadingPoste: poste.isLoading,
    isLoadingOwner: owner.isLoading,

    // Write operations
    mintPoste: mint.mintPoste,
    recordMaintenance: maintenance.recordMaintenance,
    recordReplacement: replacement.recordReplacement,
    setReading: reading.setReading,
    setOperator: operator.setOperator,

    // Transaction states - Mint
    isMinting: mint.isPending || mint.isConfirming,
    isMintConfirmed: mint.isConfirmed,
    mintHash: mint.hash,
    mintError: mint.error,

    // Transaction states - Maintenance
    isRecordingMaintenance: maintenance.isPending || maintenance.isConfirming,
    isMaintenanceConfirmed: maintenance.isConfirmed,
    maintenanceHash: maintenance.hash,
    maintenanceError: maintenance.error,

    // Transaction states - Replacement
    isRecordingReplacement: replacement.isPending || replacement.isConfirming,
    isReplacementConfirmed: replacement.isConfirmed,
    replacementHash: replacement.hash,
    replacementError: replacement.error,

    // Transaction states - Reading
    isSettingReading: reading.isPending || reading.isConfirming,
    isReadingConfirmed: reading.isConfirmed,
    readingHash: reading.hash,
    readingError: reading.error,

    // Transaction states - Operator
    isSettingOperator: operator.isPending || operator.isConfirming,
    isOperatorConfirmed: operator.isConfirmed,
    operatorHash: operator.hash,
    operatorError: operator.error,
  }
}
