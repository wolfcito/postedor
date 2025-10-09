import { http, createConfig } from "wagmi"
import { defineChain } from "viem"
import { injected, walletConnect } from "wagmi/connectors"

// Define Polkadot Asset Hub Testnet (Paseo Network)
export const polkadotAssetHubTestnet = defineChain({
  id: 420420422,
  name: "Polkadot Hub TestNet",
  nativeCurrency: {
    decimals: 18,
    name: "PAS",
    symbol: "PAS",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-passet-hub-eth-rpc.polkadot.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Paseo Asset Hub Explorer",
      url: "https://blockscout-passet-hub.parity-testnet.parity.io",
    },
  },
  testnet: true,
})

// Define Polkadot Asset Hub Mainnet
export const polkadotAssetHub = defineChain({
  id: 420420420,
  name: "Polkadot Asset Hub",
  nativeCurrency: {
    decimals: 10,
    name: "DOT",
    symbol: "DOT",
  },
  rpcUrls: {
    default: {
      http: ["https://polkadot-asset-hub-eth-rpc.polkadot.io"],
      webSocket: ["wss://polkadot-asset-hub-eth-rpc.polkadot.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Polkadot Asset Hub Explorer",
      url: "https://assethub-polkadot.subscan.io",
    },
  },
})

// WalletConnect Project ID - Get from https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id"

// Create Wagmi configuration
export const config = createConfig({
  chains: [polkadotAssetHubTestnet, polkadotAssetHub],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: "Postedor",
        description: "Sistema de gestión de postes eléctricos en blockchain",
        url: typeof window !== "undefined" ? window.location.origin : "https://postedor.app",
        icons: ["https://postedor.app/icon.png"],
      },
    }),
  ],
  transports: {
    [polkadotAssetHubTestnet.id]: http(),
    [polkadotAssetHub.id]: http(),
  },
})

declare module "wagmi" {
  interface Register {
    config: typeof config
  }
}
