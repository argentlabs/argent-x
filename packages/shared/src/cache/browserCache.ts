import { ICacheService } from "./ICacheService"

export class CacheService implements ICacheService {
  private cachePromise: Promise<Cache | null>

  constructor(
    cacheName: string,
    cachesStorage: Pick<CacheStorage, "open" | "delete">,
  ) {
    this.cachePromise = cachesStorage.open(cacheName).catch((e) => {
      console.error(new Error("Failed to open cache", { cause: e }))
      return null
    })
  }

  async get(url: string): Promise<Response> {
    const cache = await this.cachePromise

    if (!cache) {
      throw new Error("No cache available")
    }

    const response = await cache.match(url).catch(() => {
      throw new Error("Failed to match cache")
    })

    if (!response) {
      throw new Error("Failed to match cache")
    }

    return response.clone()
  }

  async set(url: string, response: Response): Promise<void> {
    const cache = await this.cachePromise

    if (!cache) {
      return // silent fail
    }

    await cache.put(url, response).catch(() => {
      throw new Error("Failed to match cache")
    })
  }

  async delete(url: string): Promise<boolean> {
    const cache = await this.cachePromise

    if (!cache) {
      return false // silent fail
    }

    return cache.delete(url)
  }

  // should be called on logout
  async flush(): Promise<void> {
    const cache = await this.cachePromise

    if (!cache) {
      return // silent fail
    }

    const keys = await cache.keys()
    await Promise.allSettled(keys.map((key) => cache.delete(key)))
  }
}
