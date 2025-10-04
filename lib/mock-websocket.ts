/**
 * Mock WebSocket for simulating real-time on-chain event streaming
 * M4-S2: Event streaming with mock websocket
 */

type WebSocketListener = (event: any) => void
type ConnectionStatusListener = (status: "connected" | "disconnected" | "reconnecting") => void

export class MockWebSocket {
  private listeners: Set<WebSocketListener> = new Set()
  private statusListeners: Set<ConnectionStatusListener> = new Set()
  private status: "connected" | "disconnected" | "reconnecting" = "disconnected"
  private eventInterval: NodeJS.Timeout | null = null
  private reconnectTimeout: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor() {
    this.connect()
  }

  /**
   * Simulate connection to blockchain event stream
   */
  connect(): void {
    console.log("[v0] MockWebSocket: Connecting...")
    this.setStatus("reconnecting")

    // Simulate connection delay
    setTimeout(
      () => {
        // Simulate occasional connection failures
        if (Math.random() < 0.1 && this.reconnectAttempts < this.maxReconnectAttempts) {
          console.log("[v0] MockWebSocket: Connection failed, retrying...")
          this.reconnectAttempts++
          this.reconnect()
          return
        }

        this.setStatus("connected")
        this.reconnectAttempts = 0
        console.log("[v0] MockWebSocket: Connected successfully")

        // Start emitting random events every 10-30 seconds
        this.startEventEmission()
      },
      1000 + Math.random() * 2000,
    )
  }

  /**
   * Disconnect from event stream
   */
  disconnect(): void {
    console.log("[v0] MockWebSocket: Disconnecting...")
    this.setStatus("disconnected")
    this.stopEventEmission()

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
  }

  /**
   * Attempt to reconnect
   */
  private reconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
    console.log(`[v0] MockWebSocket: Reconnecting in ${delay}ms...`)

    this.reconnectTimeout = setTimeout(() => {
      this.connect()
    }, delay)
  }

  /**
   * Start emitting random events
   */
  private startEventEmission(): void {
    if (this.eventInterval) {
      clearInterval(this.eventInterval)
    }

    const emitRandomEvent = () => {
      if (this.status !== "connected") return

      // Simulate random on-chain events
      const eventTypes = ["MAINTENANCE", "READING", "REPLACEMENT"]
      const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)]

      const mockEvent = {
        type: "blockchain_event",
        eventType: randomType,
        tokenId: Math.floor(Math.random() * 3) + 1, // Random pole 1-3
        blockNumber: 1000000 + Math.floor(Math.random() * 100000),
        transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        timestamp: new Date().toISOString(),
      }

      console.log("[v0] MockWebSocket: Emitting event", mockEvent)
      this.emit(mockEvent)

      // Simulate occasional disconnections
      if (Math.random() < 0.05) {
        console.log("[v0] MockWebSocket: Simulating network failure...")
        this.disconnect()
        this.reconnect()
      }
    }

    // Emit events every 10-30 seconds
    const scheduleNext = () => {
      const delay = 10000 + Math.random() * 20000
      this.eventInterval = setTimeout(() => {
        emitRandomEvent()
        scheduleNext()
      }, delay)
    }

    scheduleNext()
  }

  /**
   * Stop emitting events
   */
  private stopEventEmission(): void {
    if (this.eventInterval) {
      clearTimeout(this.eventInterval)
      this.eventInterval = null
    }
  }

  /**
   * Subscribe to events
   */
  subscribe(listener: WebSocketListener): () => void {
    this.listeners.add(listener)
    console.log("[v0] MockWebSocket: Listener subscribed, total:", this.listeners.size)

    return () => {
      this.listeners.delete(listener)
      console.log("[v0] MockWebSocket: Listener unsubscribed, total:", this.listeners.size)
    }
  }

  /**
   * Subscribe to connection status changes
   */
  onStatusChange(listener: ConnectionStatusListener): () => void {
    this.statusListeners.add(listener)

    return () => {
      this.statusListeners.delete(listener)
    }
  }

  /**
   * Emit event to all listeners
   */
  private emit(event: any): void {
    this.listeners.forEach((listener) => listener(event))
  }

  /**
   * Update connection status
   */
  private setStatus(status: "connected" | "disconnected" | "reconnecting"): void {
    this.status = status
    this.statusListeners.forEach((listener) => listener(status))
  }

  /**
   * Get current connection status
   */
  getStatus(): "connected" | "disconnected" | "reconnecting" {
    return this.status
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.disconnect()
    this.listeners.clear()
    this.statusListeners.clear()
  }
}

// Singleton instance
let mockWebSocketInstance: MockWebSocket | null = null

export function getMockWebSocket(): MockWebSocket {
  if (typeof window === "undefined") {
    // Server-side: return a dummy instance
    return {
      subscribe: () => () => {},
      onStatusChange: () => () => {},
      getStatus: () => "disconnected",
      disconnect: () => {},
      destroy: () => {},
    } as any
  }

  if (!mockWebSocketInstance) {
    mockWebSocketInstance = new MockWebSocket()
  }

  return mockWebSocketInstance
}
