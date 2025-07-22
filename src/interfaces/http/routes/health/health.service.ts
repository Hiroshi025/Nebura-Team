import { StatusEntity } from "#entity/health/status.entity";
import { exec } from "child_process";
import { Repository } from "typeorm";
import { promisify } from "util";

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

const execPromise = promisify(exec);

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(StatusEntity)
    private readonly statusRepository: Repository<StatusEntity>,
  ) {}
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

  private async getCpuUsage() {
    const { stdout } = await execPromise("ps -eo pcpu,pid,user,args");
    const lines = stdout.trim().split("\n").slice(1);
    const cpuUsages = lines.map((line) => {
      const parts = line.trim().split(/\s+/);
      return {
        cpu: parseFloat(parts[0]),
        pid: parts[1],
        user: parts[2],
        command: parts.slice(3).join(" "),
      };
    });
    return cpuUsages;
  }

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

  async getMetrics() {
    const metrics = {
      memoryUsage: process.memoryUsage(),
      cpuUsage: await this.getCpuUsage(),
      uptime: process.uptime(),
    };
    return metrics;
  }

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
