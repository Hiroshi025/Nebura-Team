import { Cache } from "cache-manager";

import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, Logger } from "@nestjs/common";

/**
 * Service to provide administrative access to the API cache.
 * Allows retrieval of cache keys, values, and all cache entries.
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  /**
   * Retrieves the value for a specific cache key.
   * @param key The cache key to retrieve.
   * @returns The value stored in cache for the given key, or null if not found.
   * @throws Error if the key is not provided.
   */
  async getCacheValue(key: string): Promise<any> {
    if (!key) {
      this.logger.warn("No cache key provided to getCacheValue.");
      throw new Error("Cache key must be provided.");
    }
    try {
      return await this.cacheManager.get(key);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get cache value for key "${key}": ${errMsg}`);
      throw new Error(`Failed to get cache value for key "${key}".`);
    }
  }

  /**
   * Retrieves all cache keys, if supported by the cache store.
   * @returns An array of cache keys.
   * @throws Error if the cache store does not support key listing.
   */
  async getCacheKeys(): Promise<string[]> {
    // Some cache stores support 'keys', others do not
    const store = (this.cacheManager as { store?: { keys?: () => Promise<string[]> } }).store;
    if (store && typeof store.keys === "function") {
      try {
        return await store.keys();
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to retrieve cache keys: ${errMsg}`);
        throw new Error("Failed to retrieve cache keys from the cache store.");
      }
    }
    this.logger.warn("The current cache store does not support key listing.");
    throw new Error("The current cache store does not support key listing.");
  }

  /**
   * Retrieves all cache entries as a key-value object.
   * @returns An object containing all cache entries.
   * @throws Error if unable to retrieve keys or values.
   */
  async getAllCache(): Promise<{ [key: string]: any }> {
    try {
      const keys = await this.getCacheKeys();
      const result: { [key: string]: any } = {};
      for (const key of keys) {
        try {
          result[key] = await this.cacheManager.get(key);
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          this.logger.warn(`Failed to get value for cache key "${key}": ${errMsg}`);
          result[key] = null;
        }
      }
      return result;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to retrieve all cache entries: ${errMsg}`);
      throw new Error("Failed to retrieve all cache entries.");
    }
  }
}
