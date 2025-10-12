"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/hooks/use-wallet"
import { Card } from "@/components/ui/card"
import { Wallet, LogOut, AlertCircle, CheckCircle2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AddNetworkButton } from "@/components/add-network-button"

export function WalletConnect() {
  const { address, balance, isConnected, isConnecting, connect, disconnect, isLoadingBalance, chain, connectors, connectError } = useWallet()
  const [showDialog, setShowDialog] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const showConnectedView = isMounted && isConnected && Boolean(address)
  const availableConnectors = isMounted ? connectors : []
  const isConnectingClient = isMounted && isConnecting
  const connectButtonLabel = isConnectingClient ? "Conectando..." : "Conectar Wallet"

  if (showConnectedView) {
    return (
      <Card className="p-4 bg-zinc-900/50 border-zinc-800">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <p className="text-sm text-zinc-400">Wallet Conectado</p>
            </div>
            <p className="font-mono text-sm truncate">{address}</p>
            {chain && (
              <p className="text-xs text-zinc-500 mt-1">
                Red: {chain.name} (ID: {chain.id})
              </p>
            )}
            {balance && !isLoadingBalance && (
              <p className="text-xs text-zinc-500">
                Balance: {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => disconnect()} className="flex-shrink-0">
            <LogOut className="w-4 h-4 mr-2" />
            Desconectar
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Button onClick={() => setShowDialog(true)} disabled={isConnectingClient} className="w-full" size="lg">
        <Wallet className="w-4 h-4 mr-2" />
        {connectButtonLabel}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conectar Wallet</DialogTitle>
            <DialogDescription>
              Selecciona tu wallet para conectarte a Polkadot Asset Hub
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {availableConnectors.map((connector) => (
              <Button
                key={connector.id}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => {
                  connect(connector)
                  setShowDialog(false)
                }}
                disabled={isConnectingClient}
              >
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5" />
                  <div>
                    <p className="font-medium">{connector.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {connector.id === "injected" && "MetaMask, Talisman, etc"}
                      {connector.id === "walletConnect" && "Conectar con código QR"}
                    </p>
                  </div>
                </div>
              </Button>
            ))}
          </div>

          {connectError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {connectError.message}
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <p className="mb-2">
                Para usar la app, agrega primero la red Polkadot a tu wallet:
              </p>
              <AddNetworkButton variant="outline" size="sm" />
              <p className="mt-2 text-muted-foreground">
                O agrégala manualmente usando el Chain ID <strong>420420422</strong> (testnet) o <strong>420420420</strong> (mainnet)
              </p>
              <p className="mt-2 text-xs">
                Faucet testnet: <a href="https://faucet.polkadot.io/?parachain=1111" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://faucet.polkadot.io/?parachain=1111</a>
              </p>
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    </>
  )
}
