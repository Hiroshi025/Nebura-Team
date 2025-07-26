/* eslint-disable prettier/prettier */
import { HealthService } from "#routes/health/health.service";

import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
	HealthCheck, HealthCheckService, MemoryHealthIndicator, TypeOrmHealthIndicator
} from "@nestjs/terminus";
import { SkipThrottle } from "@nestjs/throttler";

/**
 * Controller responsible for handling health check endpoints.
 *
 * This controller exposes endpoints to verify the application's health status,
 * retrieve system metrics, and fetch error history.
 *
 * @see {@link https://docs.nestjs.com/recipes/terminus | NestJS Terminus}
 * @see {@link https://docs.nestjs.com/controllers | NestJS Controllers}
 * @see {@link https://docs.nestjs.com/openapi/introduction | NestJS Swagger}
 *
 * @example
 * // GET /health
 * // Response:
 * // {
 * //   "status": "ok",
 * //   "info": { ... },
 * //   "error": {},
 * //   "details": { ... }
 * // }
 */
@ApiTags("health")
@ApiBearerAuth()
@SkipThrottle()
@Controller({
  path: "health",
  version: "1",
})
export class HealthController {
  /**
   * Creates an instance of HealthController.
   *
   * @param memory Instance of MemoryHealthIndicator for checking memory health.
   * @param health Instance of HealthCheckService for orchestrating health checks.
   * @param db Instance of TypeOrmHealthIndicator for checking database connectivity.
   * @param healthService Custom service for advanced health and metrics.
   */
  constructor(
    private memory: MemoryHealthIndicator,
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private readonly healthService: HealthService,
  ) {}

  /**
   * Performs health checks for memory heap, memory RSS, and database connectivity.
   *
   * Uses built-in Terminus indicators to check memory and database health.
   *
   * @returns Health check result object containing status, info, error, and details.
   *
   * @see {@link https://docs.nestjs.com/recipes/terminus#health-indicators | NestJS Health Indicators}
   * @see {@link https://docs.nestjs.com/recipes/terminus#custom-health-indicators | Custom Health Indicators}
   *
   * @example
   * // GET /health
   * // Returns health status and details.
   */
  @HealthCheck()
  @Get()
  @ApiResponse({ status: 200, description: "Health check successful" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiOperation({
    summary: "Health check",
    description: "Performs a health check on the application.",
  })
  check() {
    return this.health.check([
      /**
       * Checks the application's heap memory usage.
       * @see {@link https://docs.nestjs.com/recipes/terminus#memory-health-indicator MemoryHealthIndicator}
       */
      () => this.memory.checkHeap("memory_heap", 150 * 1024 * 1024),
      /**
       * Checks the application's RSS memory usage.
       * @see {@link https://docs.nestjs.com/recipes/terminus#memory-health-indicator MemoryHealthIndicator}
       */
      () => this.memory.checkRSS("memory_rss", 150 * 1024 * 1024),
      /**
       * Checks the database connectivity using TypeORM.
       * @see {@link https://docs.nestjs.com/recipes/terminus#typeorm-health-indicator TypeOrmHealthIndicator}
       */
      () => this.db.pingCheck("database"),
    ]);
  }

  /**
   * Returns a custom health status object with memory, CPU, and uptime details.
   *
   * @returns An object with health status and system details.
   *
   * @example
   * // GET /health/status
   * // Returns:
   * // {
   * //   status: "ok",
   * //   info: { ... },
   * //   error: null,
   * //   details: { ... }
   * // }
   */
  @Get("status")
  @ApiResponse({ status: 200, description: "Health status retrieved successfully" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiOperation({
    summary: "Get health status",
    description: "Retrieves the current health status of the application.",
  })
  getHealthStatus() {
    return this.healthService.checkHealth();
  }

  /**
   * Returns system metrics including memory usage, CPU usage, and uptime.
   *
   * @returns An object with memoryUsage, cpuUsage, and uptime.
   *
   * @example
   * // GET /health/metrics
   * // Returns:
   * // {
   * //   memoryUsage: { ... },
   * //   cpuUsage: [ ... ],
   * //   uptime: 123.45
   * // }
   */
  @Get("metrics")
  @ApiResponse({ status: 200, description: "System metrics retrieved successfully" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiOperation({
    summary: "Get system metrics",
    description: "Retrieves system metrics such as memory usage, CPU usage, and uptime.",
  })
  getMetrics() {
    return this.healthService.getMetrics();
  }

  /**
   * Returns the last 100 error history records from the database.
   *
   * @returns An array of error history objects.
   *
   * @example
   * // GET /health/errors
   * // Returns:
   * // [
   * //   { id: 1, timestamp: ..., memoryUsage: ..., ... },
   * //   ...
   * // ]
   */
  @Get("errors")
  @ApiResponse({ status: 200, description: "Error history retrieved successfully" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiOperation({
    summary: "Get error history",
    description: "Retrieves the last 100 error history records from the database.",
  })
  getErrorHistory() {
    return this.healthService.getErrorHistory();
  }
}
