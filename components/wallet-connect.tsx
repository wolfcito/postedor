"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "@/hooks/use-wallet"
import { Card } from "@/components/ui/card"
import { Wallet, LogOut } from "lucide-react"

export function WalletConnect() {
  const { address, balance, isConnected, isConnecting, connect, disconnect, isLoadingBalance } = useWallet()

  if (isConnected && address) {
    return (
      <Card className="p-4 bg-zinc-900/50 border-zinc-800">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-400">Connected Wallet</p>
            <p className="font-mono text-sm truncate">{address}</p>
            {balance && !isLoadingBalance && (
              <p className="text-xs text-zinc-500 mt-1">
                Balance: {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => disconnect()} className="flex-shrink-0">
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Button onClick={connect} disabled={isConnecting} className="w-full" size="lg">
      <Wallet className="w-4 h-4 mr-2" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  )
}
