/**
 * Smart Contract Configuration - PostedorNFT
 *
 * ABI imported from deployed contract
 */

import PostedorABI from "@/jsons/PostedorNFT.abi.json"

export const POSTEDOR_ABI = PostedorABI as const

// Contract addresses - update these with your deployed contract addresses
export const CONTRACT_ADDRESSES = {
  POSTEDOR: process.env.NEXT_PUBLIC_POSTEDOR_CONTRACT_ADDRESS,
} as const

// Contract configuration object for easy access
export const CONTRACTS = {
  postedor: {
    address: CONTRACT_ADDRESSES.POSTEDOR as `0x${string}`,
    abi: POSTEDOR_ABI,
  },
} as const
