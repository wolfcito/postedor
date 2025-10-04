/**
 * Mock event stream abstraction for real-time timeline updates
 * Prepares for future WebSocket or Server-Sent Events integration
 */

type EventListener = (event: any) => void

class EventStream {
  private listeners: Map<string, Set<EventListener>> = new Map()

  /**
   * Subscribe to events for a specific pole
   */
  subscribe(tokenId: string, listener: EventListener): () => void {
    if (!this.listeners.has(tokenId)) {
      this.listeners.set(tokenId, new Set())
    }

    this.listeners.get(tokenId)!.add(listener)
    console.log("[v0] Event stream: Subscribed to pole", tokenId)

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(tokenId)
      if (listeners) {
        listeners.delete(listener)
        console.log("[v0] Event stream: Unsubscribed from pole", tokenId)
      }
    }
  }

  /**
   * Emit an event for a specific pole
   */
  emit(tokenId: string, event: any): void {
    const listeners = this.listeners.get(tokenId)
    if (listeners) {
      console.log("[v0] Event stream: Emitting event to", listeners.size, "listeners for pole", tokenId)
      listeners.forEach((listener) => listener(event))
    }
  }

  /**
   * Get number of active listeners for a pole
   */
  getListenerCount(tokenId: string): number {
    return this.listeners.get(tokenId)?.size || 0
  }
}

// Singleton instance
export const eventStream = new EventStream()

/**
 * Hook for subscribing to pole events in React components
 */
export function useEventStream(tokenId: string, onEvent: EventListener) {
  if (typeof window === "undefined") return

  const unsubscribe = eventStream.subscribe(tokenId, onEvent)
  return unsubscribe
}
