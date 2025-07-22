/* eslint-disable prettier/prettier */
import { HealthService } from "#routes/health/health.service";

import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
	HealthCheck, HealthCheckService, MemoryHealthIndicator, TypeOrmHealthIndicator
} from "@nestjs/terminus";
import { SkipThrottle } from "@nestjs/throttler";

/**
 * Controller responsible for handling health check endpoints.
 *
 * This controller exposes a GET endpoint to verify the application's health status,
 * including memory usage and database connectivity.
 *
 * @see {@link https://docs.nestjs.com/recipes/terminus NestJS Terminus}
 * @see {@link https://docs.nestjs.com/controllers NestJS Controllers}
 * @see {@link https://docs.nestjs.com/openapi/introduction NestJS Swagger}
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
   * @returns Health check result object containing status, info, error, and details.
   *
   * @see {@link https://docs.nestjs.com/recipes/terminus#health-indicators NestJS Health Indicators}
   * @see {@link https://docs.nestjs.com/recipes/terminus#custom-health-indicators Custom Health Indicators}
   */
  @Get()
  @HealthCheck()
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

  @Get()
  getHealthStatus() {
    return this.healthService.checkHealth();
  }

  @Get("metrics")
  getMetrics() {
    return this.healthService.getMetrics();
  }

  @Get("errors")
  getErrorHistory() {
    return this.healthService.getErrorHistory();
  }
}
