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

    const logs = await client.getLogs({
      address: contractAddress,
      abi: POSTEDOR_ABI,
      eventName: "ApprovalForAll",
      args: { owner },
      fromBlock: 0n,
      toBlock: "latest",
    })

    const operatorStatus = new Map<string, OperatorLog & { approved: boolean }>()

    for (const log of logs) {
      const operator = log.args?.operator
      const approved = log.args?.approved

      if (!operator || typeof approved !== "boolean") {
        continue
      }

      operatorStatus.set(operator.toLowerCase(), {
        address: operator,
        txHash: log.transactionHash,
        blockNumber: log.blockNumber ? log.blockNumber.toString() : undefined,
        approved,
      })
    }

    const operators = Array.from(operatorStatus.values())
      .filter((entry) => entry.approved)
      .map((entry) => ({
        address: entry.address,
        txHash: entry.txHash,
        blockNumber: entry.blockNumber,
      }))

    return NextResponse.json({
      owner,
      operators,
    })
  } catch (error) {
    console.error("[contract/operators] Failed to load operators from chain:", error)
    return NextResponse.json({ error: "Failed to load operators" }, { status: 500 })
  }
}
