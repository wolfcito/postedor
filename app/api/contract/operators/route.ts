import { NextResponse } from "next/server"
import { createPublicClient, http } from "viem"
import { polkadotAssetHubTestnet } from "@/lib/chains"
import { POSTEDOR_ABI, CONTRACT_ADDRESSES } from "@/lib/contracts"

type OperatorLog = {
  address: string
  txHash?: `0x${string}`
  blockNumber?: string
}

export const runtime = "nodejs"

export async function GET() {
  const contractAddress = CONTRACT_ADDRESSES.POSTEDOR

  if (!contractAddress) {
    return NextResponse.json({ error: "Contract address not configured" }, { status: 500 })
  }

  const client = createPublicClient({
    chain: polkadotAssetHubTestnet,
    transport: http(),
  })

  try {
    const owner = await client.readContract({
      address: contractAddress,
      abi: POSTEDOR_ABI,
      functionName: "owner",
    })

    const explorerBaseUrl =
      process.env.BLOCKSCOUT_API_URL ?? "https://blockscout-passet-hub.parity-testnet.parity.io/api"
    const methodSelector = "0x558a7297" // setOperator(address,bool)
    const maxPages = 5
    const pageSize = 200
    const operatorStatus = new Map<string, OperatorLog & { approved: boolean }>()

    for (let page = 1; page <= maxPages; page++) {
      const qs = new URLSearchParams({
        module: "account",
        action: "txlist",
        address: contractAddress,
        sort: "asc",
        page: page.toString(),
        offset: pageSize.toString(),
      })

      const txResponse = await fetch(`${explorerBaseUrl}?${qs.toString()}`, {
        cache: "no-store",
      })

      if (!txResponse.ok) {
        throw new Error(`Blockscout request failed with status ${txResponse.status}`)
      }

      const txPayload: {
        status?: string
        result?: Array<{
          input: string
          hash: string
          timeStamp?: string
          blockNumber?: string
          txreceipt_status?: string
        }>
        message?: string
      } = await txResponse.json()

      if (txPayload.status !== "1" || !Array.isArray(txPayload.result)) {
        break
      }

      const relevantTxs = txPayload.result.filter(
        (tx) => tx.txreceipt_status !== "0" && typeof tx.input === "string" && tx.input.startsWith(methodSelector),
      )

      for (const tx of relevantTxs) {
        const encoded = tx.input.slice(10) // strip 0x + 4-byte selector
        if (encoded.length < 128) {
          continue
        }

        const addressPart = encoded.slice(24, 64)
        const enabledPart = encoded.slice(64, 128)
        if (addressPart.length < 40 || enabledPart.length === 0) {
          continue
        }

        const operatorAddress = `0x${addressPart.slice(-40)}`
        const enabled = BigInt(`0x${enabledPart}`) === 1n
        const operatorKey = operatorAddress.toLowerCase()

        operatorStatus.set(operatorKey, {
          address: operatorAddress,
          txHash: tx.hash,
          blockNumber: tx.blockNumber,
          approved: enabled,
        })
      }

      // If the page returned less than the requested page size, we've reached the end.
      if (txPayload.result.length < pageSize) {
        break
      }
    }

    const operators = Array.from(operatorStatus.values())
      .filter((entry) => entry.approved)
      .map((entry) => ({
        address: entry.address,
        txHash: entry.txHash,
        blockNumber: entry.blockNumber,
      }))
      .sort((a, b) => {
        const aBlock = a.blockNumber ? Number(a.blockNumber) : 0
        const bBlock = b.blockNumber ? Number(b.blockNumber) : 0
        return bBlock - aBlock
      })

    return NextResponse.json({
      owner,
      operators,
    })
  } catch (error) {
    console.error("[contract/operators] Failed to load operators from chain:", error)
    return NextResponse.json({ error: "Failed to load operators" }, { status: 500 })
  }
}
