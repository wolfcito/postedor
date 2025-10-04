/**
 * Mock blockchain transaction simulation
 * M5: On-chain Write Integration (Mock)
 */

export interface MockTransaction {
  hash: string
  from: string
  to: string
  value: string
  data: string
  gasLimit: string
  gasPrice: string
  nonce: number
  status: "pending" | "confirming" | "confirmed" | "failed"
  blockNumber?: number
  blockHash?: string
  confirmations: number
  timestamp: string
  error?: string
}

export interface GasEstimate {
  gasLimit: string
  gasPrice: string
  maxFeePerGas: string
  maxPriorityFeePerGas: string
  estimatedCost: string // in ETH
  estimatedCostUSD: string
}

/**
 * Generate a mock transaction hash
 */
export function generateTxHash(): string {
  return `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`
}

/**
 * Generate a mock block hash
 */
export function generateBlockHash(): string {
  return `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`
}

/**
 * Estimate gas for a transaction
 */
export async function estimateGas(operation: "mint" | "intervention"): Promise<GasEstimate> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500))

  const baseGas = operation === "mint" ? 150000 : 80000
  const gasLimit = (baseGas + Math.floor(Math.random() * 20000)).toString()
  const gasPrice = (30 + Math.random() * 20).toFixed(2) // Gwei
  const maxFeePerGas = (Number.parseFloat(gasPrice) * 1.2).toFixed(2)
  const maxPriorityFeePerGas = (2 + Math.random() * 3).toFixed(2)

  const estimatedCostWei = Number.parseInt(gasLimit) * Number.parseFloat(gasPrice) * 1e9
  const estimatedCostETH = (estimatedCostWei / 1e18).toFixed(6)
  const ethPriceUSD = 2500 + Math.random() * 500 // Mock ETH price
  const estimatedCostUSD = (Number.parseFloat(estimatedCostETH) * ethPriceUSD).toFixed(2)

  console.log("[v0] Gas estimation:", {
    operation,
    gasLimit,
    gasPrice: `${gasPrice} Gwei`,
    estimatedCost: `${estimatedCostETH} ETH ($${estimatedCostUSD})`,
  })

  return {
    gasLimit,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
    estimatedCost: estimatedCostETH,
    estimatedCostUSD,
  }
}

/**
 * Create and submit a mock transaction
 */
export async function submitTransaction(operation: "mint" | "intervention", data: any): Promise<MockTransaction> {
  const txHash = generateTxHash()
  const timestamp = new Date().toISOString()

  const tx: MockTransaction = {
    hash: txHash,
    from: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    to: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Mock contract address
    value: "0",
    data: JSON.stringify(data),
    gasLimit: "150000",
    gasPrice: "35",
    nonce: Math.floor(Math.random() * 1000),
    status: "pending",
    confirmations: 0,
    timestamp,
  }

  console.log("[v0] Transaction submitted:", {
    hash: txHash,
    operation,
    timestamp,
  })

  // Simulate transaction lifecycle
  simulateTransactionLifecycle(tx)

  return tx
}

/**
 * Simulate transaction confirmation process
 */
function simulateTransactionLifecycle(tx: MockTransaction): void {
  // Simulate occasional failures (5% chance)
  const willFail = Math.random() < 0.05

  // Pending → Confirming (2-5 seconds)
  setTimeout(
    () => {
      if (willFail) {
        tx.status = "failed"
        tx.error = "Transaction reverted: Insufficient gas or contract error"
        console.log("[v0] Transaction failed:", tx.hash)
        return
      }

      tx.status = "confirming"
      tx.blockNumber = 1000000 + Math.floor(Math.random() * 100000)
      tx.blockHash = generateBlockHash()
      tx.confirmations = 1
      console.log("[v0] Transaction confirming:", tx.hash, "Block:", tx.blockNumber)
    },
    2000 + Math.random() * 3000,
  )

  // Confirming → Confirmed (add confirmations every 2-3 seconds)
  if (!willFail) {
    const confirmationInterval = setInterval(
      () => {
        if (tx.status === "failed") {
          clearInterval(confirmationInterval)
          return
        }

        tx.confirmations++
        console.log("[v0] Transaction confirmations:", tx.hash, tx.confirmations)

        if (tx.confirmations >= 3) {
          tx.status = "confirmed"
          clearInterval(confirmationInterval)
          console.log("[v0] Transaction confirmed:", tx.hash)
        }
      },
      2000 + Math.random() * 1000,
    )
  }
}

/**
 * Get transaction status
 */
export async function getTransactionStatus(txHash: string): Promise<MockTransaction | null> {
  // In a real implementation, this would query the blockchain
  // For mock, we'll return null (transaction not found in this session)
  console.log("[v0] Querying transaction status:", txHash)
  return null
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(txHash: string, confirmations = 1): Promise<MockTransaction> {
  console.log("[v0] Waiting for transaction:", txHash, "confirmations:", confirmations)

  // Simulate waiting
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        hash: txHash,
        from: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        to: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        value: "0",
        data: "",
        gasLimit: "150000",
        gasPrice: "35",
        nonce: 0,
        status: "confirmed",
        blockNumber: 1000000 + Math.floor(Math.random() * 100000),
        blockHash: generateBlockHash(),
        confirmations,
        timestamp: new Date().toISOString(),
      })
    }, confirmations * 3000)
  })
}

/**
 * Get mock explorer URL for transaction
 */
export function getExplorerUrl(txHash: string): string {
  return `https://mock-explorer.example.com/tx/${txHash}`
}
