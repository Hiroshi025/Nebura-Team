/* eslint-disable @typescript-eslint/require-await */
import { StatusEntity } from "#adapters/database/entities/health/status.entity";
import * as os from "os"; // Añadido
// import { exec } from "child_process"; // Eliminado
import { Repository } from "typeorm";

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

// const execPromise = promisify(exec); // Eliminado

/**
 * Service for monitoring application health and retrieving system metrics.
 *
 * This service provides methods to check the application's health status,
 * retrieve system metrics (memory, CPU, uptime), and fetch error history from the database.
 *
 * @see {@link https://docs.nestjs.com/providers NestJS Providers}
 * @see {@link https://nodejs.org/api/process.html#processmemoryusage Node.js process.memoryUsage}
 * @see {@link https://typeorm.io/#/repository-api TypeORM Repository API}
 *
 * @example
 * // Usage in a controller:
 * import { Controller, Get } from '@nestjs/common';
 * import { HealthService } from './health.service';
 *
 * @Controller('health')
 * export class HealthController {
 *   constructor(private readonly healthService: HealthService) {}
 *
 *   @Get()
 *   async getHealth() {
 *     return this.healthService.checkHealth();
 *   }
 * }
 */
@Injectable()
export class HealthService {
  /**
   * Creates an instance of HealthService.
   * @param statusRepository Injected TypeORM repository for {@link StatusEntity}.
   */
  constructor(
    @InjectRepository(StatusEntity)
    private readonly statusRepository: Repository<StatusEntity>,
  ) {}

  /**
   * Retrieves the current health status of the application.
   *
   * Returns memory usage, CPU usage, and uptime information.
   *
   * @returns An object containing health status, memory, CPU, and uptime.
   *
   * @example
   * const status = await healthService.getHealthStatus();
   * // status = { status: "healthy", memory: {...}, cpu: [...], uptime: 123.45 }
   */
  async getHealthStatus() {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = await this.getCpuUsage();
    const uptime = process.uptime();

    return {
      status: "healthy",
      memory: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
      },
      cpu: cpuUsage,
      uptime: uptime,
    };
  }

  /**
   * Retrieves CPU usage information for the current process and system.
   *
   * Usa métodos nativos de Node.js para obtener estadísticas de CPU.
   *
   * @returns Un objeto con el uso de CPU del proceso y estadísticas del sistema.
   */
  private async getCpuUsage() {
    // Uso de CPU del proceso desde el último reinicio
    const cpuUsage = process.cpuUsage();
    // Estadísticas de los núcleos del sistema
    const cpus = os.cpus();

    // Calcular porcentaje de uso de CPU del proceso (aproximado)
    const user = cpuUsage.user / 1000; // microsegundos a milisegundos
    const system = cpuUsage.system / 1000;
    const totalProcessMs = user + system;
    const uptimeMs = process.uptime() * 1000;
    const processCpuPercent = uptimeMs > 0 ? (totalProcessMs / uptimeMs) * 100 : 0;

    return {
      process: {
        userMs: user,
        systemMs: system,
        cpuPercent: processCpuPercent,
      },
      system: cpus.map((cpu, idx) => ({
        core: idx,
        model: cpu.model,
        speed: cpu.speed,
        times: cpu.times,
      })),
    };
  }

  /**
   * Checks the overall health of the application.
   *
   * Returns a summary object with status, info, error, and details.
   *
   * @returns An object with health status and details.
   *
   * @example
   * const health = await healthService.checkHealth();
   * // health = { status: "ok", info: {...}, error: null, details: {...} }
   */
  async checkHealth() {
    const healthStatus = await this.getHealthStatus();
    return {
      status: "ok",
      info: healthStatus,
      error: null,
      details: {
        memory: healthStatus.memory,
        cpu: healthStatus.cpu,
        uptime: healthStatus.uptime,
      },
    };
  }

  /**
   * Retrieves system metrics including memory usage, CPU usage, and uptime.
   *
   * @returns An object containing memoryUsage, cpuUsage, and uptime.
   *
   * @example
   * const metrics = await healthService.getMetrics();
   * // metrics = { memoryUsage: {...}, cpuUsage: [...], uptime: 123.45 }
   */
  async getMetrics() {
    const metrics = {
      memoryUsage: process.memoryUsage(),
      cpuUsage: await this.getCpuUsage(),
      uptime: process.uptime(),
    };
    return metrics;
  }

  /**
   * Retrieves the last 100 error history records from the database.
   *
   * Each record includes id, timestamp, memory usage, CPU usage, error count, and additional info.
   *
   * @returns An array of error history objects.
   *
   * @example
   * const errors = await healthService.getErrorHistory();
   * // errors = [{ id: 1, timestamp: ..., memoryUsage: ..., ... }, ...]
   */
  async getErrorHistory() {
    const errors = await this.statusRepository.find({
      order: { timestamp: "DESC" },
      take: 100, // Limit to the last 100 error records
    });
    return errors.map((error) => ({
      id: error.id,
      timestamp: error.timestamp,
      memoryUsage: error.memoryUsage,
      cpuUsage: error.cpuUsage,
      errorCount: error.errorCount,
      additionalInfo: error.additionalInfo,
    }));
  }
}
