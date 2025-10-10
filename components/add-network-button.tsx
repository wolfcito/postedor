"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AddNetworkButtonProps {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

export function AddNetworkButton({ variant = "outline", size = "sm" }: AddNetworkButtonProps) {
  const { toast } = useToast()

  const addPolkadotTestnet = async () => {
    try {
      if (typeof window.ethereum === "undefined") {
        toast({
          title: "Wallet no detectada",
          description: "Por favor instala una wallet compatible con PolkaVM (MetaMask, Talisman, etc.)",
          variant: "destructive",
        })
        return
      }

      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x1911F0A6", // 420420422 in hex
            chainName: "Polkadot Hub TestNet",
            nativeCurrency: {
              name: "PAS",
              symbol: "PAS",
              decimals: 18,
            },
            rpcUrls: ["https://testnet-passet-hub-eth-rpc.polkadot.io"],
            blockExplorerUrls: ["https://blockscout-passet-hub.parity-testnet.parity.io"],
          },
        ],
      })

      toast({
        title: "Red agregada",
        description: "Polkadot Hub TestNet (Paseo) ha sido agregada a tu wallet",
      })
    } catch (error: any) {
      if (error.code === 4001) {
        toast({
          title: "Cancelado",
          description: "Has cancelado la adición de la red",
        })
      } else {
        toast({
          title: "Error",
          description: error.message || "No se pudo agregar la red",
          variant: "destructive",
        })
      }
    }
  }

  const addPolkadotMainnet = async () => {
    try {
      if (typeof window.ethereum === "undefined") {
        toast({
          title: "Wallet no detectada",
          description: "Por favor instala una wallet compatible con PolkaVM (MetaMask, Talisman, etc.)",
          variant: "destructive",
        })
        return
      }

      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x190E3C44", // 420420420 in hex
            chainName: "Polkadot Asset Hub",
            nativeCurrency: {
              name: "DOT",
              symbol: "DOT",
              decimals: 10,
            },
            rpcUrls: ["https://polkadot-asset-hub-eth-rpc.polkadot.io"],
            blockExplorerUrls: ["https://assethub-polkadot.subscan.io"],
          },
        ],
      })

      toast({
        title: "Red agregada",
        description: "Polkadot Asset Hub ha sido agregada a tu wallet",
      })
    } catch (error: any) {
      if (error.code === 4001) {
        toast({
          title: "Cancelado",
          description: "Has cancelado la adición de la red",
        })
      } else {
        toast({
          title: "Error",
          description: error.message || "No se pudo agregar la red",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant={variant} size={size} onClick={addPolkadotTestnet}>
        <Plus className="h-4 w-4 mr-2" />
        Agregar Testnet
      </Button>
      <Button variant={variant} size={size} onClick={addPolkadotMainnet}>
        <Plus className="h-4 w-4 mr-2" />
        Agregar Mainnet
      </Button>
    </div>
  )
}

// Add type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on?: (event: string, callback: (...args: any[]) => void) => void
      removeListener?: (event: string, callback: (...args: any[]) => void) => void
    }
  }
}

export {}
