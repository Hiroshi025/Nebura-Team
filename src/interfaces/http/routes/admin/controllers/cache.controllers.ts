/* eslint-disable prettier/prettier */
import { Roles } from "#common/decorators/role.decorator";
import { RoleGuard } from "#common/guards/role.guard";
import { UserRole } from "#common/typeRole";
import { CacheService } from "#routes/admin/cache.service";

import {
	Controller, Get, HttpException, HttpStatus, InternalServerErrorException, Logger, Param,
	UseGuards
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

/**
 * AdminCacheController
 *
 * Controller for administrative cache management endpoints.
 * Provides endpoints for listing all cache keys, retrieving a cache value by key,
 * and fetching all cache entries.
 *
 * Security:
 * - All endpoints require a valid Bearer token for authentication.
 * - Intended for use by admin-level users.
 */
@UseGuards(AuthGuard("jwt"), RoleGuard)
@ApiTags("admin")
@ApiBearerAuth()
@Controller({
  path: "admin/cache",
  version: "1",
})
export class AdminCacheController {
  private readonly logger = new Logger(AdminCacheController.name);
  constructor(private readonly adminCacheService: CacheService) {}

  /**
   * Retrieves all cache keys.
   * @returns An array of cache keys.
   */
  @Roles(UserRole.DEVELOPER)
  @Get("keys")
  async getAllKeys() {
    try {
      return await this.adminCacheService.getCacheKeys();
    } catch (error: any) {
      this.logger.error("Failed to retrieve cache keys", error.stack);
      throw new InternalServerErrorException(error instanceof Error ? error.message : "Internal server error", {
        cause: error instanceof Error ? error : undefined,
        description: "Failed to retrieve cache keys",
      });
    }
  }

  /**
   * Retrieves the value for a specific cache key.
   * @param key The cache key to retrieve.
   * @returns The value stored in cache for the given key.
   */
  @Roles(UserRole.DEVELOPER)
  @Get("value/:key")
  async getValue(@Param("key") key: string): Promise<string | number | boolean | object> {
    try {
      const value = await this.adminCacheService.getCacheValue(key);
      if (typeof value === "undefined" || value === null) {
        throw new HttpException("Cache key not found", HttpStatus.NOT_FOUND);
      }
      // Optionally, you can further validate/cast value here if needed
      return value as string | number | boolean | object;
    } catch (error: any) {
      this.logger.error(`Failed to retrieve cache value for key "${key}"`, error.stack);
      throw new InternalServerErrorException(error instanceof Error ? error.message : "Internal server error", {
        cause: error instanceof Error ? error : undefined,
        description: "Failed to retrieve cache value",
      });
    }
  }

  /**
   * Retrieves all cache entries as a key-value object.
   * @returns An object containing all cache entries.
   */
  @Roles(UserRole.DEVELOPER)
  @Get("all")
  async getAllCache() {
    try {
      return await this.adminCacheService.getAllCache();
    } catch (error: any) {
      this.logger.error("Failed to retrieve all cache entries", error.stack);
      throw new InternalServerErrorException(error instanceof Error ? error.message : "Internal server error", {
        cause: error instanceof Error ? error : undefined,
        description: "Failed to retrieve all cache entries",
      });
    }
  }
}
