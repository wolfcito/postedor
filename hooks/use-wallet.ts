"use client"

import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi"
import { injected } from "wagmi/connectors"

/**
 * Custom hook for wallet connection and account management
 */
export function useWallet() {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount()
  const { connect, connectors, error: connectError, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balance, isLoading: isLoadingBalance } = useBalance({
    address,
  })

  const connectWallet = () => {
    const injectedConnector = connectors.find((c) => c.id === "injected")
    if (injectedConnector) {
      connect({ connector: injectedConnector })
    }
  }

  return {
    // Account info
    address,
    balance,
    isLoadingBalance,

    // Connection state
    isConnected,
    isConnecting,
    isDisconnected,

    // Actions
    connect: connectWallet,
    disconnect,

    // Errors
    connectError,
    isPending,

    // Available connectors
    connectors,
  }
}
