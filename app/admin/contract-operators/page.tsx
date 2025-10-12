"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft, Shield, Users } from "lucide-react"
import Link from "next/link"
import { useAccount } from "wagmi"
import { useSetOperator } from "@/hooks/use-postedor-contract"
import { WalletConnect } from "@/components/wallet-connect"
import { polkadotAssetHubTestnet } from "@/lib/wagmi"

type ContractOperator = {
  address: string
  txHash?: string
  blockNumber?: string
}

export default function ContractOperatorsPage() {
  const { toast } = useToast()
  const { address, isConnected, chainId } = useAccount()
  const { setOperator, hash, isPending, isConfirming, isConfirmed, error } = useSetOperator()

  const [operatorAddress, setOperatorAddress] = useState("")
  const [isEnabled, setIsEnabled] = useState(true)
  const [contractOperators, setContractOperators] = useState<ContractOperator[]>([])
  const [isFetchingOperators, setIsFetchingOperators] = useState(false)
  const [operatorFetchError, setOperatorFetchError] = useState<string | null>(null)
  const [hasFetchedOperators, setHasFetchedOperators] = useState(false)
  const [contractOwner, setContractOwner] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSetOperator = () => {
    if (!operatorAddress || !/^0x[a-fA-F0-9]{40}$/.test(operatorAddress)) {
      toast({
        title: "Dirección inválida",
        description: "Ingresa una dirección válida en formato 0x...",
        variant: "destructive",
      })
      return
    }

    if (chainId !== polkadotAssetHubTestnet.id) {
      toast({
        title: "Red incorrecta",
        description: "Cambia a Polkadot Asset Hub Testnet",
        variant: "destructive",
      })
      return
    }

    console.log("[v0] [OPERATOR] Setting operator:", {
      address: operatorAddress,
      enabled: isEnabled,
    })

    setOperator(operatorAddress as `0x${string}`, isEnabled)
  }

  const fetchContractOperators = async () => {
    setIsFetchingOperators(true)
    setOperatorFetchError(null)

    try {
      const response = await fetch("/api/contract/operators")
      if (!response.ok) {
        throw new Error("No se pudo obtener la lista de operadores del contrato")
      }

      const data: { owner?: string; operators?: ContractOperator[] } = await response.json()
      setContractOwner(data.owner ?? null)
      setContractOperators(data.operators ?? [])
    } catch (fetchError) {
      console.error("[test] Error fetching contract operators:", fetchError)
      setOperatorFetchError(
        fetchError instanceof Error ? fetchError.message : "Error desconocido al consultar los operadores",
      )
    } finally {
      setIsFetchingOperators(false)
      setHasFetchedOperators(true)
    }
  }

  const operatorsSection = (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Operadores configurados
        </CardTitle>
        <CardDescription>Consulta la lista de operadores habilitados directamente desde la blockchain.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Owner actual:{" "}
            {contractOwner ? <span className="font-mono break-all">{contractOwner}</span> : "consulta para visualizarlo"}
          </p>
          <Button onClick={fetchContractOperators} disabled={isFetchingOperators} variant="outline">
            {isFetchingOperators ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Consultando...
              </>
            ) : (
              "Consultar operadores (Read)"
            )}
          </Button>
        </div>

        {operatorFetchError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{operatorFetchError}</AlertDescription>
          </Alert>
        )}

        {isFetchingOperators ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Obteniendo información on-chain...
          </div>
        ) : hasFetchedOperators ? (
          contractOperators.length > 0 ? (
            <div className="space-y-3">
              {contractOperators.map((operator) => (
                <div key={operator.address} className="rounded-md border bg-muted/20 p-3">
                  <p className="font-mono text-sm break-all">{operator.address}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {operator.blockNumber && <span>Bloque: {operator.blockNumber}</span>}
                    {operator.txHash && (
                      <a
                        href={`https://blockscout-passet-hub.parity-testnet.parity.io/tx/${operator.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        Ver transacción
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No se encontraron operadores habilitados actualmente. Verifica que se haya configurado alguno y vuelve a
              intentar.
            </p>
          )
        ) : (
          <p className="text-sm text-muted-foreground">
            Pulsa &quot;Consultar operadores&quot; para obtener la lista de direcciones autorizadas como operadores.
          </p>
        )}
      </CardContent>
    </Card>
  )

  // Handle success
  if (isConfirmed && hash) {
    return (
      <div className="page-shell max-w-4xl space-y-6 py-8">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Operator Configurado</h1>
          </div>
        </div>

        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-500">
            El operator ha sido {isEnabled ? "habilitado" : "deshabilitado"} exitosamente.
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="pt-6 space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Dirección</p>
              <p className="font-mono text-sm break-all">{operatorAddress}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              <p className="text-sm">{isEnabled ? "✅ Habilitado" : "❌ Deshabilitado"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Transaction Hash</p>
              <a
                href={`https://blockscout-passet-hub.parity-testnet.parity.io/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-blue-500 hover:underline break-all"
              >
                {hash}
              </a>
            </div>
          </CardContent>
        </Card>

        {operatorsSection}

        <Button
          onClick={() => {
            setOperatorAddress("")
            window.location.reload()
          }}
          variant="outline"
          className="w-full"
        >
          Configurar Otro Operator
        </Button>
      </div>
    )
  }

  return (
    <div className="page-shell max-w-4xl space-y-6 py-8">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Gestionar Operators del Contrato</h1>
          <p className="text-muted-foreground">Habilita o deshabilita operators para el contrato on-chain</p>
        </div>
      </div>

      {/* Wallet Connection */}
      <WalletConnect />

      {!isMounted || !isConnected ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Conecta tu wallet para gestionar operators. Debes ser el owner del contrato.</AlertDescription>
        </Alert>
      ) : chainId !== polkadotAssetHubTestnet.id ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Cambia a Polkadot Asset Hub Testnet (Paseo) en tu wallet para continuar.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {operatorsSection}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurar Operator
              </CardTitle>
              <CardDescription>
                Los operators pueden mintear postes y realizar operaciones on-chain. Solo el owner del contrato puede gestionar
                operators.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Wallet Info */}
              <Alert className="bg-blue-500/5 border-blue-500/50">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-sm">
                  <strong>Tu wallet:</strong>
                  <p className="font-mono text-xs mt-1 break-all">{address}</p>
                </AlertDescription>
              </Alert>

              {/* Operator Address */}
              <div className="space-y-2">
                <Label htmlFor="operatorAddress">
                  Dirección del Operator <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="operatorAddress"
                  placeholder="0x..."
                  value={operatorAddress}
                  onChange={(e) => setOperatorAddress(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Ingresa la dirección en PolkaVM (formato 0x...) que quieres habilitar/deshabilitar como operator
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => address && setOperatorAddress(address)}
                  className="w-full"
                >
                  Usar Mi Wallet
                </Button>
              </div>

              {/* Enable/Disable Toggle */}
              <div className="space-y-2">
                <Label>Acción</Label>
                <div className="flex gap-2">
                  <Button
                    variant={isEnabled ? "default" : "outline"}
                    onClick={() => setIsEnabled(true)}
                    className="flex-1"
                  >
                    Habilitar
                  </Button>
                  <Button
                    variant={!isEnabled ? "default" : "outline"}
                    onClick={() => setIsEnabled(false)}
                    className="flex-1"
                  >
                    Deshabilitar
                  </Button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm break-all">{error.message}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                onClick={handleSetOperator}
                disabled={!operatorAddress || isPending || isConfirming}
                className="w-full"
                size="lg"
              >
                {isPending || isConfirming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isPending ? "Esperando confirmación..." : "Confirmando..."}
                  </>
                ) : (
                  <>{isEnabled ? "Habilitar Operator (Write)" : "Deshabilitar Operator (Write)"}</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm space-y-2">
              <p>
                <strong>Importante:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Solo el owner del contrato puede ejecutar esta operación</li>
                <li>Los operators pueden mintear postes y realizar operaciones on-chain</li>
                <li>Puedes habilitarte a ti mismo como operator usando el botón "Usar Mi Wallet"</li>
                <li>Necesitas fondos PAS en tu wallet para pagar el gas</li>
                <li>
                  Asegúrate de tener fondos PAS desde el{" "}
                  <a
                    href="https://faucet.polkadot.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Paseo Faucet
                  </a>
                </li>
              </ul>
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  )
}
