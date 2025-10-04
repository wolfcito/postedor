import { type NextRequest, NextResponse } from "next/server"
import type { BlockchainTransaction } from "@/lib/types"

// Mock transaction store (in-memory for demo)
const mockTransactions: BlockchainTransaction[] = []

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get("type")
  const status = searchParams.get("status")
  const search = searchParams.get("search")

  let filtered = [...mockTransactions]

  if (type && type !== "all") {
    filtered = filtered.filter((tx) => tx.type === type)
  }

  if (status && status !== "all") {
    filtered = filtered.filter((tx) => tx.status === status)
  }

  if (search) {
    filtered = filtered.filter(
      (tx) =>
        tx.hash.toLowerCase().includes(search.toLowerCase()) ||
        tx.assetTag?.toLowerCase().includes(search.toLowerCase()),
    )
  }

  // Sort by timestamp descending
  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return NextResponse.json({
    transactions: filtered,
    total: filtered.length,
  })
}

// Helper to add transaction to store
export function addTransaction(tx: BlockchainTransaction) {
  mockTransactions.push(tx)
}
