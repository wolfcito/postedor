"use client"

import { http, createConfig } from "wagmi"
import { injected, walletConnect } from "wagmi/connectors"
import { polkadotAssetHubTestnet, polkadotAssetHub } from "./chains"

export { polkadotAssetHubTestnet, polkadotAssetHub } from "./chains"

// WalletConnect Project ID - Get from https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id"

const connectors = [
  injected({
    shimDisconnect: true,
  }),
  ...(typeof window !== "undefined"
    ? [
        walletConnect({
          projectId,
          showQrModal: true,
          metadata: {
            name: "Postedor",
            description: "Sistema de gestión de postes eléctricos en blockchain",
            url: window.location.origin,
            icons: ["https://postedor.app/icon.png"],
          },
        }),
      ]
    : []),
]

// Create Wagmi configuration
export const config = createConfig({
  chains: [polkadotAssetHubTestnet, polkadotAssetHub],
  connectors,
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
