/**
 * Multi-level cache manager for optimized data access
 * M4-S3: Cache optimization and failover
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  source: "memory" | "localStorage" | "api"
}

interface CacheMetrics {
  hits: number
  misses: number
  memoryHits: number
  localStorageHits: number
  apiHits: number
  averageLatency: number
  lastUpdate: string
}

class CacheManager {
  private memoryCache: Map<string, CacheEntry<any>> = new Map()
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    memoryHits: 0,
    localStorageHits: 0,
    apiHits: 0,
    averageLatency: 0,
    lastUpdate: new Date().toISOString(),
  }
  private latencies: number[] = []

  /**
   * Get data with multi-level cache fallback
   * Memory → localStorage → API
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: {
      ttl?: number // Time to live in milliseconds
      staleWhileRevalidate?: boolean
    } = {},
  ): Promise<T> {
    const startTime = Date.now()
    const ttl = options.ttl || 60000 // Default 60 seconds
    const now = Date.now()

    // Level 1: Memory cache
    const memoryEntry = this.memoryCache.get(key)
    if (memoryEntry && now - memoryEntry.timestamp < ttl) {
      this.recordHit("memory", Date.now() - startTime)
      console.log("[v0] Cache: Memory hit for", key)
      return memoryEntry.data
    }

    // Level 2: localStorage
    if (typeof window !== "undefined") {
      try {
        const localStorageData = localStorage.getItem(`cache:${key}`)
        if (localStorageData) {
          const entry: CacheEntry<T> = JSON.parse(localStorageData)
          if (now - entry.timestamp < ttl) {
            // Update memory cache
            this.memoryCache.set(key, entry)
            this.recordHit("localStorage", Date.now() - startTime)
            console.log("[v0] Cache: localStorage hit for", key)

            // Stale-while-revalidate: return cached data but fetch fresh in background
            if (options.staleWhileRevalidate && now - entry.timestamp > ttl / 2) {
              console.log("[v0] Cache: Revalidating in background for", key)
              this.revalidateInBackground(key, fetcher, ttl)
            }

            return entry.data
          }
        }
      } catch (error) {
        console.log("[v0] Cache: localStorage error:", error)
      }
    }

    // Level 3: API fetch
    console.log("[v0] Cache: Fetching from API for", key)
    this.metrics.misses++

    try {
      const data = await fetcher()
      const entry: CacheEntry<T> = {
        data,
        timestamp: now,
        source: "api",
      }

      // Store in memory cache
      this.memoryCache.set(key, entry)

      // Store in localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`cache:${key}`, JSON.stringify(entry))
        } catch (error) {
          console.log("[v0] Cache: localStorage write error:", error)
        }
      }

      this.recordHit("api", Date.now() - startTime)
      return data
    } catch (error) {
      console.log("[v0] Cache: API fetch error:", error)

      // Failover: return stale data if available
      if (memoryEntry) {
        console.log("[v0] Cache: Returning stale memory data as failover")
        return memoryEntry.data
      }

      if (typeof window !== "undefined") {
        try {
          const localStorageData = localStorage.getItem(`cache:${key}`)
          if (localStorageData) {
            const entry: CacheEntry<T> = JSON.parse(localStorageData)
            console.log("[v0] Cache: Returning stale localStorage data as failover")
            return entry.data
          }
        } catch (e) {
          console.log("[v0] Cache: localStorage failover error:", e)
        }
      }

      throw error
    }
  }

  /**
   * Revalidate cache in background
   */
  private async revalidateInBackground<T>(key: string, fetcher: () => Promise<T>, ttl: number): Promise<void> {
    try {
      const data = await fetcher()
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        source: "api",
      }

      this.memoryCache.set(key, entry)

      if (typeof window !== "undefined") {
        localStorage.setItem(`cache:${key}`, JSON.stringify(entry))
      }

      console.log("[v0] Cache: Background revalidation completed for", key)
    } catch (error) {
      console.log("[v0] Cache: Background revalidation failed for", key, error)
    }
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key: string): void {
    this.memoryCache.delete(key)

    if (typeof window !== "undefined") {
      localStorage.removeItem(`cache:${key}`)
    }

    console.log("[v0] Cache: Invalidated", key)
  }

  /**
   * Clear all caches
   */
  clear(): void {
    this.memoryCache.clear()

    if (typeof window !== "undefined") {
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (key.startsWith("cache:")) {
          localStorage.removeItem(key)
        }
      })
    }

    console.log("[v0] Cache: Cleared all caches")
  }

  /**
   * Record cache hit
   */
  private recordHit(source: "memory" | "localStorage" | "api", latency: number): void {
    this.metrics.hits++

    if (source === "memory") {
      this.metrics.memoryHits++
    } else if (source === "localStorage") {
      this.metrics.localStorageHits++
    } else {
      this.metrics.apiHits++
    }

    this.latencies.push(latency)
    if (this.latencies.length > 100) {
      this.latencies.shift()
    }

    this.metrics.averageLatency = this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length
    this.metrics.lastUpdate = new Date().toISOString()
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    return { ...this.metrics }
  }

  /**
   * Get cache hit rate
   */
  getHitRate(): number {
    const total = this.metrics.hits + this.metrics.misses
    return total === 0 ? 0 : this.metrics.hits / total
  }
}

// Singleton instance
export const cacheManager = new CacheManager()

/**
 * React hook for cached data fetching
 */
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    ttl?: number
    staleWhileRevalidate?: boolean
  },
) {
  return cacheManager.get(key, fetcher, options)
}
