import { http, createConfig } from "wagmi"
import { defineChain } from "viem"

// Define Polkadot Asset Hub chain configuration
export const polkadotAssetHub = defineChain({
  id: 420420421, // Chain ID for Polkadot Asset Hub
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
  contracts: {
    // Add your deployed contract addresses here
    // Example:
    // postedor: {
    //   address: "0x...",
    //   blockCreated: 0,
    // },
  },
})

// Create Wagmi configuration
export const config = createConfig({
  chains: [polkadotAssetHub],
  transports: {
    [polkadotAssetHub.id]: http(),
  },
})

declare module "wagmi" {
  interface Register {
    config: typeof config
  }
}
