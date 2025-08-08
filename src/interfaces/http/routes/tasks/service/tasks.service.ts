/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { IPBlockerEntity } from "#entity/admin/ips-blocker.entity";
import { UserEntity } from "#entity/users/user.entity";
import { NotificationEntity } from "#entity/utils/tools/notification.entity";
import { LessThan, MoreThanOrEqual, Repository } from "typeorm";

import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

/**
 * Service for scheduled tasks logic.
 * @see https://docs.nestjs.com/providers
 */
@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(IPBlockerEntity)
    private readonly ipBlockerRepository: Repository<IPBlockerEntity>,
  ) {}

  /**
   * Purges expired notifications from the database.
   * Deletes all notifications whose expiration date is in the past.
   * @returns {Promise<{ deleted: number; message: string }>}
   * @see https://typeorm.io/#/repository-api
   * @example
   * await tasksService.purgeExpiredNotifications();
   */
  async purgeExpiredNotifications(): Promise<{ deleted: number; message: string }> {
    const repo = this.userRepository.manager.getRepository(NotificationEntity);
    const now = new Date();
    const expiredNotifications = await repo.find({
      where: {
        expiresAt: LessThan(now),
      },
    });

    if (expiredNotifications.length === 0) {
      return { deleted: 0, message: "No expired notifications found." };
    }

    for (const notification of expiredNotifications) {
      await repo.remove(notification);
    }

    return { deleted: expiredNotifications.length, message: "Expired notifications have been deleted." };
  }

  /**
   * Logs blocked IPs from the last 24 hours and the last 5 blocked IPs.
   * @param logger Logger instance for output.
   * @returns {Promise<void>}
   * @see https://typeorm.io/#/repository-api
   * @example
   * await tasksService.logRecentBlockedIPs(logger);
   */
  async logRecentBlockedIPs(logger: Logger): Promise<void> {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Blocked IPs in the last 24 hours
    const recentIPs = await this.ipBlockerRepository.find({
      where: {
        blockedAt: MoreThanOrEqual(yesterday),
        isActive: true,
      },
      order: { blockedAt: "DESC" },
    });

    // Last 5 blocked IPs
    const lastFiveIPs = await this.ipBlockerRepository.find({
      where: { isActive: true },
      order: { blockedAt: "DESC" },
      take: 5,
    });

    if (recentIPs.length > 0) {
      logger.debug(`Blocked IPs in the last 24 hours:`);
      recentIPs.forEach((ip) => {
        logger.debug(`- ${ip.ipAddress} (blocked at: ${ip.blockedAt})`);
      });
    }

    if (lastFiveIPs.length > 0) {
      logger.debug(`Last 5 blocked IPs:`);
      lastFiveIPs.forEach((ip) => {
        logger.debug(`- ${ip.ipAddress} (blocked at: ${ip.blockedAt})`);
      });
    }
  }
}
