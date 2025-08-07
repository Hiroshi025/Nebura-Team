/* eslint-disable @typescript-eslint/require-await */
import * as os from "os";

import { Injectable } from "@nestjs/common";

/**
 * Service to monitor application health and retrieve system metrics.
 */
@Injectable()
export class HealthService {
  constructor() {}

  /**
   * Returns health status and system metrics.
   * Includes error handling and extended metrics.
   */
  async getHealth() {
    try {
      const memory = process.memoryUsage();
      const cpus = os.cpus();
      const loadavg = os.loadavg();
      const uptime = process.uptime();
      const cpuUsage = process.cpuUsage();
      const platform = process.platform;
      const nodeVersion = process.version;
      const totalMem = os.totalmem();
      const freeMem = os.freemem();

      // Calculate process CPU usage percentage (approximate)
      const userMs = cpuUsage.user / 1000;
      const systemMs = cpuUsage.system / 1000;
      const totalProcessMs = userMs + systemMs;
      const uptimeMs = uptime * 1000;
      const processCpuPercent = uptimeMs > 0 ? (totalProcessMs / uptimeMs) * 100 : 0;

      return {
        status: "ok",
        info: {
          memory: {
            rss: memory.rss,
            heapTotal: memory.heapTotal,
            heapUsed: memory.heapUsed,
            external: memory.external,
            totalMem,
            freeMem,
            usedMem: totalMem - freeMem,
            memPercent: totalMem > 0 ? ((totalMem - freeMem) / totalMem) * 100 : 0,
          },
          cpu: {
            process: {
              userMs,
              systemMs,
              cpuPercent: processCpuPercent,
            },
            system: {
              cores: cpus,
              model: cpus[0]?.model,
              speed: cpus[0]?.speed,
              loadavg,
            },
          },
          uptime,
          platform,
          nodeVersion,
        },
        error: null,
        details: {
          memory: {
            rss: memory.rss,
            heapTotal: memory.heapTotal,
            heapUsed: memory.heapUsed,
            external: memory.external,
            totalMem,
            freeMem,
            usedMem: totalMem - freeMem,
            memPercent: totalMem > 0 ? ((totalMem - freeMem) / totalMem) * 100 : 0,
          },
          cpu: {
            process: {
              userMs,
              systemMs,
              cpuPercent: processCpuPercent,
            },
            system: {
              cores: cpus.length,
              model: cpus[0]?.model,
              speed: cpus[0]?.speed,
              loadavg,
            },
          },
          uptime,
          platform,
          nodeVersion,
        },
      };
    } catch (error: unknown) {
      let message = "Error retrieving health metrics";
      let stack: string | undefined = undefined;
      if (error instanceof Error) {
        message = error.message;
        stack = error.stack;
      }
      return {
        status: "error",
        info: null,
        error: {
          message,
          stack,
        },
        details: null,
      };
    }
  }
}
