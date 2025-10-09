import { http, createConfig } from "wagmi"
import { injected, walletConnect } from "wagmi/connectors"
import { polkadotAssetHubTestnet, polkadotAssetHub } from "./chains"

export { polkadotAssetHubTestnet, polkadotAssetHub } from "./chains"

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
