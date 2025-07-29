import { IPBlockerEntity } from "#entity/admin/ips-blocker.entity";
import { NextFunction, Request, Response } from "express";
import { DataSource } from "typeorm";

import { ForbiddenException, Injectable, Logger, NestMiddleware } from "@nestjs/common";

interface RequestExtended extends Request {
  ip?: string; // Ensure the request object has an ip property
  connection?: {
    remoteAddress?: string; // Ensure the connection object has a remoteAddress property
  };
}

/**
 * Middleware to block requests from IPs marked as blocked in the database.
 * Checks if the request IP is blocked and active, and throws Forbidden if so.
 */
@Injectable()
export class IPBlockerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(IPBlockerMiddleware.name);
  constructor(private readonly dataSource: DataSource) {}

  async use(req: RequestExtended, _res: Response, next: NextFunction) {
    const ip = req.ip || req.connection?.remoteAddress;
    if (!ip) {
      this.logger.warn("IP address not found");
      return next();
    }

    const repo = this.dataSource.getRepository(IPBlockerEntity);
    const blocked = await repo.findOne({ where: { ipAddress: ip, isActive: true } });
    if (blocked) {
      this.logger.warn(`Blocked IP access attempt: ${ip} - Reason: ${blocked.reason || "No reason provided"}`);
      throw new ForbiddenException("Your IP is blocked.");
    }
    next();
  }
}
