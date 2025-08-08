import { Controller, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

import { TasksService } from "../service/tasks.service";

/**
 * Controller for scheduled tasks.
 * Delegates business logic to TasksService.
 * @see https://docs.nestjs.com/controllers
 */
@Controller("tasks")
export class TasksController {
  private readonly logger = new Logger(TasksController.name);

  constructor(private readonly tasksService: TasksService) {}

  /**
   * Scheduled job to purge expired notifications.
   * Runs daily at 1AM UTC.
   * @returns {Promise<{ deleted: number; message: string }>}
   * @see https://docs.nestjs.com/techniques/task-scheduling
   * @example
   * // This method runs automatically via cron.
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM, { name: "purgeExpiredNotifications", timeZone: "UTC" })
  async purgeExpiredNotifications(): Promise<{ deleted: number; message: string }> {
    return this.tasksService.purgeExpiredNotifications();
  }

  /**
   * Scheduled job to log recent blocked IPs.
   * Runs every hour.
   * @returns {Promise<void>}
   * @see https://docs.nestjs.com/techniques/task-scheduling
   * @example
   * // This method runs automatically via cron.
   */
  @Cron(CronExpression.EVERY_HOUR, { name: "logRecentBlockedIPs", timeZone: "UTC" })
  async logRecentBlockedIPs(): Promise<void> {
    await this.tasksService.logRecentBlockedIPs(this.logger);
  }
}