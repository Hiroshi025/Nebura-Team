import { RequestClient } from "#/types";
import {
	TicketCreate, TicketEdit, TicketExportFilters, TicketSearch
} from "#adapters/schemas/admin/ticket.schema";
import { RolesAdmin } from "#adapters/schemas/auth.schema";
import { LicenceCreateSchema, LicenceCreateType } from "#adapters/schemas/licence.schema";
import { isValidNotification } from "#adapters/schemas/shared/notification.schema";
import { UuidType } from "#adapters/schemas/shared/uuid.schema";
import { AuthenticatedGuard } from "#common/guards/auth-discord.guard";
import { UserRole } from "#common/typeRole";
import { TicketEntity, TicketPriority } from "#entity/users/support/tickets.entity";
import { UserEntity } from "#entity/users/user.entity";
import { LicenseEntity, LicenseType } from "#entity/utils/licence.entity";
import { RequestStatEntity } from "#entity/utils/metrics/request.entity";
import { NotificationEntity } from "#entity/utils/tools/notification.entity";
import { randomUUID } from "crypto";
import { Response } from "express-serve-static-core";
import { IsNull, MoreThan, Repository } from "typeorm";

import {
	BadRequestException, Body, Controller, Get, HttpException, HttpStatus, Logger, Param, Post, Req,
	Res, UseGuards
} from "@nestjs/common";
import { ApiExcludeController, ApiExcludeEndpoint } from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";

import { HealthService } from "./health/service/health.service";

/**
 * Dashboard utilities controller.
 *
 * This controller provides auxiliary endpoints for the dashboard frontend,
 * such as real-time system status in JSON format and user management utilities.
 *
 * @see {@link https://docs.nestjs.com/controllers NestJS Controllers Documentation}
 * @see {@link HealthService}
 *
 * @example
 * // Example usage in a browser:
 * // GET http://localhost:3000/dashboard/utils/status-json
 * // Response:
 * // {
 * //   "memory": { ... },
 * //   "cpu": { ... },
 * //   "uptime": 123456,
 * //   "now": "2024-06-09T12:34:56.789Z"
 * // }
 */
@ApiExcludeController(true)
@Controller({
  path: "dashboard/utils",
})
export class UtilsController {
  private readonly logger = new Logger(UtilsController.name);
  /**
   * Creates an instance of UtilsController.
   *
   * @param healthService - Injected HealthService for system health checks.
   * @param userRepository - Injected UserEntity repository for user operations.
   */
  constructor(
    private readonly healthService: HealthService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Returns the current system status in JSON format.
   *
   * This endpoint is designed for real-time dashboard updates via AJAX/fetch.
   * It provides memory usage, CPU usage, uptime, and the current timestamp.
   *
   * @returns {Promise<{memory: any, cpu: any, uptime: number, now: string}>}
   * An object containing memory, CPU, uptime, and timestamp.
   *
   * @example
   * fetch('/dashboard/utils/status-json')
   *   .then(res => res.json())
   *   .then(data => {
   *     console.log(data.memory); // Memory info
   *     console.log(data.cpu);    // CPU info
   *     console.log(data.uptime); // Uptime in seconds
   *     console.log(data.now);    // ISO timestamp
   *   });
   *
   * @see {@link HealthService.checkHealth}
   * @see {@link https://docs.nestjs.com/controllers NestJS Controllers Documentation}
   */
  @Get("status-json")
  @ApiExcludeEndpoint()
  async statusJson(): Promise<any> {
    const health = await this.healthService.getHealth();
    // Devuelve toda la estructura de health
    return health;
  }

  /**
   * Converts a user to a client by setting `isClient` to true.
   *
   * @param uuid - The UUID of the user to convert.
   * @returns {Promise<{success: boolean, message: string, data: UserEntity | null}>}
   * An object indicating success, a message, and the updated user data.
   *
   * @throws {HttpException} If the user is not found or update fails.
   *
   * @example
   * // Request body:
   * // { "uuid": "user-uuid-string" }
   * fetch('/dashboard/utils/convert-to-client', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ uuid: 'user-uuid-string' })
   * })
   *   .then(res => res.json())
   *   .then(data => {
   *     if (data.success) {
   *       console.log('User converted:', data.data);
   *     } else {
   *       console.error('Error:', data.message);
   *     }
   *   });
   *
   * @see {@link https://typeorm.io/#/repository-api TypeORM Repository API}
   */
  @Post("convert-to-client")
  @ApiExcludeEndpoint()
  async convertToClient(@Body("uuid") uuid: string): Promise<{
    success: boolean;
    message: string;
    data: UserEntity | null;
  }> {
    const user = await this.userRepository.findOne({ where: { uuid } });
    if (!user) {
      return { success: false, message: "User not found", data: null };
    }
    if (user.isClient) {
      return { success: true, message: "User is already a client", data: user };
    }
    user.isClient = true;
    await this.userRepository.save(user);
    return { success: true, message: "User converted to client successfully", data: user };
  }

  /**
   * Cambia el rol de un usuario específico.
   *
   * Expects a request body containing the user's UUID and the new role.
   * Validates the input using Zod before proceeding.
   *
   * @param body - Object containing uuid and role.
   * @returns An object indicating success and the updated user data.
   * @throws {BadRequestException} If validation fails or the update operation fails.
   *
   * @example
   * // Request body:
   * // { "uuid": "user-uuid-string", "role": "admin" }
   */
  @Post("change-user-role")
  @ApiExcludeEndpoint()
  async changeUserRole(
    @Body() body: { uuid: UuidType; role: string },
  ): Promise<{ success: boolean; message: string; data: UserEntity | null }> {
    const user = await this.userRepository.findOne({ where: { uuid: body.uuid } });
    if (!user) {
      throw new BadRequestException("User not found", {
        cause: "User not found",
        description: "The specified user does not exist in the database.",
      });
    }

    user.role = body.role as UserRole;
    await this.userRepository.save(user);

    return {
      success: true,
      message: "User role updated successfully",
      data: user,
    };
  }

  /**
   * Retrieves the distribution of API activity by endpoint.
   *
   * @returns {Promise<Array<{endpoint: string, count: number}>>}
   * An array of objects with endpoint names and request counts.
   *
   * @example
   * fetch('/dashboard/utils/activity-distribution')
   *   .then(res => res.json())
   *   .then(stats => {
   *     stats.forEach(stat => {
   *       console.log(stat.endpoint, stat.count);
   *     });
   *   });
   *
   * @see {@link https://typeorm.io/#/select-query-builder TypeORM QueryBuilder}
   */
  @Get("activity-distribution")
  @UseGuards(AuthenticatedGuard)
  @ApiExcludeEndpoint()
  async getActivityDistribution(@Req() req: any): Promise<Array<{ endpoint: string; count: number }>> {
    const userId = req.user?.id;
    const user = await this.userRepository
      .createQueryBuilder("user")
      .where(`"user"."discordInfo"->>'id' = :id`, { id: userId })
      .andWhere(`"user"."deletedAt" IS NULL`)
      .getOne();
    if (!user) return [];
    const stats = await this.userRepository.manager
      .getRepository(RequestStatEntity)
      .createQueryBuilder("stat")
      .select("stat.endpoint", "endpoint")
      .addSelect("COUNT(*)", "count")
      .where("stat.clientId = :uuid", { uuid: user.uuid })
      .groupBy("stat.endpoint")
      .getRawMany();
    return stats as Array<{ endpoint: string; count: number }>;
  }

  /**
   * Retrieves the number of requests per day.
   *
   * @returns {Promise<Array<{date: string, totalRequests: number}>>}
   * An array of objects with date and total request count per day.
   *
   * @example
   * fetch('/dashboard/utils/requests-per-day')
   *   .then(res => res.json())
   *   .then(stats => {
   *     stats.forEach(stat => {
   *       console.log(stat.date, stat.totalRequests);
   *     });
   *   });
   *
   * @see {@link https://typeorm.io/#/select-query-builder TypeORM QueryBuilder}
   */
  @Get("requests-per-day")
  @UseGuards(AuthenticatedGuard)
  @ApiExcludeEndpoint()
  async getRequestsPerDay(@Req() req: any): Promise<Array<{ date: string; totalRequests: number }>> {
    const userId = req.user?.id;
    const user = await this.userRepository
      .createQueryBuilder("user")
      .where(`"user"."discordInfo"->>'id' = :id`, { id: userId })
      .andWhere(`"user"."deletedAt" IS NULL`)
      .getOne();

    if (!user) return [];
    const stats = await this.userRepository.manager
      .getRepository(RequestStatEntity)
      .createQueryBuilder("stat")
      .select("DATE(stat.createdAt)", "date")
      .addSelect("SUM(stat.requests)", "totalRequests")
      .where("stat.clientId = :uuid", { uuid: user.uuid })
      .groupBy("DATE(stat.createdAt)")
      .orderBy("date", "ASC")
      .getRawMany();
    return stats.map((stat: any) => ({
      date: stat.date,
      totalRequests: Number(stat.totalRequests),
    })) as Array<{ date: string; totalRequests: number }>;
  }

  /**
   * Retrieves the distribution of licenses by type.
   *
   * @returns {Promise<Array<{ type: string; count: number }>>}
   * Retrieves the distribution of licenses by type.
   */
  @Get("license-distribution")
  @UseGuards(AuthenticatedGuard)
  @ApiExcludeEndpoint()
  async getLicenseDistribution(@Req() req: any): Promise<Array<{ type: string; count: number }>> {
    const userId = req.user?.id;
    const user = await this.userRepository
      .createQueryBuilder("user")
      .where(`"user"."discordInfo"->>'id' = :id`, { id: userId })
      .andWhere(`"user"."deletedAt" IS NULL`)
      .getOne();

    if (!user) return [];

    const stats = await this.userRepository.manager
      .getRepository(LicenseEntity)
      .createQueryBuilder("license")
      .select("license.type", "type")
      .addSelect("COUNT(*)", "count")
      .where("license.userId = :uuid", { uuid: user.uuid })
      .groupBy("license.type")
      .getRawMany();
    return stats as Array<{ type: string; count: number }>;
  }

  /**
   *
   * @returns {Promise<Array<{ key: string; type: string; requestLimit: number; requestCount: number }>>}
   * Retrieves the current license usage statistics.
   */
  @Get("license-usage")
  @UseGuards(AuthenticatedGuard)
  @ApiExcludeEndpoint()
  async getLicenseUsage(
    @Req() req: any,
  ): Promise<Array<{ key: string; type: string; requestLimit: number; requestCount: number }>> {
    const userId = req.user?.id;
    const user = await this.userRepository
      .createQueryBuilder("user")
      .where(`"user"."discordInfo"->>'id' = :id`, { id: userId })
      .andWhere(`"user"."deletedAt" IS NULL`)
      .getOne();

    if (!user) return [];

    const licenses = await this.userRepository.manager
      .getRepository(LicenseEntity)
      .createQueryBuilder("license")
      .select("license.key", "key")
      .addSelect("license.type", "type")
      .addSelect("license.requestLimit", "requestLimit")
      .addSelect("license.requestCount", "requestCount")
      .where("license.userId = :uuid", { uuid: user.uuid })
      .getRawMany();

    return licenses as Array<{ key: string; type: string; requestLimit: number; requestCount: number }>;
  }

  /**
   * Retrieves the number of active and expired licenses over time.
   *
   * @returns {Promise<Array<{ date: string; active: number; expired: number }>>}
   * An array of objects with date, active licenses count, and expired licenses count.
   *
   * @example
   * fetch('/dashboard/utils/licenses-over-time')
   *   .then(res => res.json())
   *   .then(data => {
   *     data.forEach(item => {
   *       console.log(item.date, item.active, item.expired);
   *     });
   *   });
   *
   * @see {@link https://typeorm.io/#/select-query-builder TypeORM QueryBuilder}
   */
  @Get("licenses-over-time")
  @UseGuards(AuthenticatedGuard)
  @ApiExcludeEndpoint()
  async getLicensesOverTime(@Req() req: any): Promise<Array<{ date: string; active: number; expired: number }>> {
    const userId = req.user?.id;
    const user = await this.userRepository
      .createQueryBuilder("user")
      .where(`"user"."discordInfo"->>'id' = :id`, { id: userId })
      .andWhere(`"user"."deletedAt" IS NULL`)
      .getOne();

    if (!user) return [];

    const raw = await this.userRepository.manager
      .getRepository(LicenseEntity)
      .createQueryBuilder("license")
      .select("TO_CHAR(license.createdAt, 'YYYY-MM')", "date")
      .addSelect("SUM(CASE WHEN license.validUntil > NOW() THEN 1 ELSE 0 END)", "active")
      .addSelect("SUM(CASE WHEN license.validUntil <= NOW() THEN 1 ELSE 0 END)", "expired")
      .where("license.userId = :uuid", { uuid: user.uuid })
      .groupBy("date")
      .orderBy("date", "ASC")
      .getRawMany();
    return raw.map((item: any) => ({
      date: item.date,
      active: Number(item.active),
      expired: Number(item.expired),
    })) as Array<{ date: string; active: number; expired: number }>;
  }

  /**
   * Retrieves a summary of license counts by type.
   *
   * @returns {Promise<{ total: number; basic: number; premium: number; enterprise: number }>}
   * An object containing total, basic, premium, and enterprise license counts.
   *
   * @example
   * fetch('/dashboard/utils/license-summary')
   *   .then(res => res.json())
   *   .then(summary => {
   *     console.log(summary);
   *     // { total: 100, basic: 50, premium: 30, enterprise: 20 }
   *   });
   */
  @Get("license-summary")
  @UseGuards(AuthenticatedGuard)
  @ApiExcludeEndpoint()
  async getLicenseSummary(@Req() req: any) {
    const userId = req.user?.id;
    const user = await this.userRepository
      .createQueryBuilder("user")
      .where(`"user"."discordInfo"->>'id' = :id`, { id: userId })
      .andWhere(`"user"."deletedAt" IS NULL`)
      .getOne();

    if (!user) return [];

    const repo = this.userRepository.manager.getRepository(LicenseEntity);
    const [basic, premium, enterprise, total] = await Promise.all([
      repo.count({ where: { type: LicenseType.BASIC, userId: user.uuid } }),
      repo.count({ where: { type: LicenseType.PREMIUM, userId: user.uuid } }),
      repo.count({ where: { type: LicenseType.ENTERPRISE, userId: user.uuid } }),
      repo.count(),
    ]);
    return { total, basic, premium, enterprise };
  }

  /**
   * Creates a new notification in the system.
   *
   * This endpoint allows the creation of dashboard notifications, which can be used to inform users
   * about important events, updates, or alerts. The notification will expire at the specified date.
   *
   * @param body - The notification data, including message, type, and expiration date.
   * @returns {Promise<NotificationEntity>} The created notification entity.
   *
   * @throws {HttpException} If the notification data is invalid.
   *
   * @example
   * // Request body:
   * // { "message": "System maintenance at midnight", "type": "warning", "expiresAt": "2024-06-30T23:59:59Z" }
   * fetch('/dashboard/utils/create-notification', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ message: 'System maintenance at midnight', type: 'warning', expiresAt: '2024-06-30T23:59:59Z' })
   * })
   *   .then(res => res.json())
   *   .then(notification => {
   *     console.log(notification);
   *   });
   *
   * @see {@link https://docs.nestjs.com/controllers NestJS Controllers Documentation}
   * @see {@link NotificationEntity}
   */
  @Post("create-notification")
  @ApiExcludeEndpoint()
  async create(@Body() body: { message: string; type: string; expiresAt: string }): Promise<NotificationEntity> {
    const repo = this.userRepository.manager.getRepository(NotificationEntity);
    const expiresAt = new Date(body.expiresAt);
    const validation = isValidNotification.safeParse({
      ...body,
      expiresAt: expiresAt,
    });

    if (!validation.success) {
      this.logger.error("Validation failed for create notification", validation.error);
      throw new HttpException(validation.error.message, HttpStatus.BAD_REQUEST);
    }

    const notification = repo.create({
      message: body.message,
      type: body.type || "info",
      expiresAt: expiresAt,
    });

    if (!notification) {
      this.logger.error("Failed to create notification: Invalid data");
      throw new HttpException("Invalid notification data", HttpStatus.BAD_REQUEST);
    }

    await repo.save(notification);
    return notification;
  }

  /**
   * Retrieves the latest active notifications.
   *
   * This endpoint returns up to 3 notifications that are either not expired or have no expiration date.
   * Notifications are ordered by creation date, descending.
   *
   * @returns {Promise<NotificationEntity[]>} Array of notification entities.
   *
   * @example
   * fetch('/dashboard/utils/get-notifications')
   *   .then(res => res.json())
   *   .then(notifications => {
   *     notifications.forEach(n => console.log(n.message));
   *   });
   *
   * @see {@link NotificationEntity}
   */
  @Get("get-notifications")
  @ApiExcludeEndpoint()
  async getNotifications(): Promise<NotificationEntity[]> {
    const repo = this.userRepository.manager.getRepository(NotificationEntity);
    const now = new Date();
    const notifications = await repo.find({
      where: [{ expiresAt: undefined }, { expiresAt: MoreThan(now) }],
      order: { createdAt: "DESC" },
      take: 3,
    });
    return notifications;
  }

  /**
   * Create a new support ticket for the authenticated user.
   */
  @Post("tickets/create")
  @ApiExcludeEndpoint()
  @UseGuards(AuthenticatedGuard)
  async createTicket(
    @Req() req: any,
    @Body()
    body: Partial<TicketCreate>,
  ) {
    const userId = req.user?.id;
    const user = await this.userRepository
      .createQueryBuilder("user")
      .where(`"user"."discordInfo"->>'id' = :id`, { id: userId })
      .andWhere(`"user"."deletedAt" IS NULL`)
      .getOne();
    if (!user) throw new HttpException("User not found", HttpStatus.NOT_FOUND);

    const ticketRepo = this.userRepository.manager.getRepository(TicketEntity);
    const isValidPriority = body.priority as TicketPriority;
    const ticket = ticketRepo.create({
      uuid: randomUUID(),
      userId: user.uuid,
      title: body.title,
      description: body.description,
      category: body.category,
      priority: isValidPriority || "low",
      links: body.links,
      attachments: body.attachments,
      fields: body.fields,
      status: "open",
    });
    await ticketRepo.save(ticket);

    user.tickets = Array.isArray(user.tickets) ? user.tickets : [];
    user.tickets.push({
      id: ticket.id,
      uuid: ticket.uuid,
      title: ticket.title,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    });
    await this.userRepository.save(user);

    return { success: true, ticket };
  }

  /**
   * Advanced search for tickets with multiple filters.
   * Permite buscar tickets por userId, assignedTo, tags, keywords, date ranges, attachment types, etc.
   */
  @Post("tickets/search")
  @ApiExcludeEndpoint()
  @UseGuards(AuthenticatedGuard)
  async searchTickets(
    @Req() _req: any,
    @Body()
    body: Partial<TicketSearch>,
  ) {
    const qb = this.userRepository.manager.getRepository(TicketEntity).createQueryBuilder("ticket");

    // Filtros básicos
    //if (body.userId) qb.andWhere("ticket.userId = :userId", { userId: body.userId });
    if (body.assignedTo) qb.andWhere("ticket.assignedTo = :assignedTo", { assignedTo: body.assignedTo });
    if (body.category) qb.andWhere("ticket.category = :category", { category: body.category });
    if (body.status) qb.andWhere("ticket.status = :status", { status: body.status });
    if (body.customStatus) qb.andWhere("ticket.customStatus = :customStatus", { customStatus: body.customStatus });

    // Tags (array contiene al menos uno de los tags buscados)
    if (body.tags && body.tags.length > 0) {
      qb.andWhere(
        body.tags.map((_, i) => `ticket.tags LIKE :tag${i}`).join(" OR "),
        Object.fromEntries(body.tags.map((tag, i) => [`tag${i}`, `%${tag}%`])),
      );
    }

    // Keywords en título o descripción
    if (body.keywords) {
      qb.andWhere("(ticket.title ILIKE :kw OR ticket.description ILIKE :kw)", { kw: `%${body.keywords}%` });
    }

    // Rango de fechas
    if (body.dateFrom) qb.andWhere("ticket.createdAt >= :dateFrom", { dateFrom: body.dateFrom });
    if (body.dateTo) qb.andWhere("ticket.createdAt <= :dateTo", { dateTo: body.dateTo });

    // Attachment types (busca por extensión en attachments)
    if (body.attachmentTypes && body.attachmentTypes.length > 0) {
      qb.andWhere(
        body.attachmentTypes.map((_ext, i) => `ticket.attachments LIKE :att${i}`).join(" OR "),
        Object.fromEntries(body.attachmentTypes.map((ext, i) => [`att${i}`, `%.${ext}%`])),
      );
    }

    qb.orderBy("ticket.createdAt", "DESC");
    const tickets = await qb.getMany();
    return { tickets };
  }

  /**
   * Edits a ticket with new data.
   * Allows updating assignment, tags, custom status, and logs changes in history.
   *
   * @param body - The ticket update data.
   * @returns {Promise<{success: boolean, message: string, data: TicketEntity | null}>}
   */
  @Post("tickets/edit")
  @ApiExcludeEndpoint()
  @UseGuards(AuthenticatedGuard)
  async editTicketAdmin(
    @Body()
    body: Partial<TicketEdit>,
  ): Promise<{ success: boolean; message: string; data: TicketEntity | null }> {
    const ticketRepo = this.userRepository.manager.getRepository(TicketEntity);
    const ticket = await ticketRepo.findOne({ where: { uuid: body.ticketUuid } });
    if (!ticket) {
      return { success: false, message: "Ticket not found", data: null };
    }

    // Track changes for history
    const changes: Record<string, any> = {};
    const updatableFields = [
      "title",
      "description",
      "status",
      "priority",
      "category",
      "links",
      "attachments",
      "fields",
      "tags",
      "assignedTo",
      "customStatus",
    ];
    updatableFields.forEach((field) => {
      if (
        (body as Record<string, any>)[field] !== undefined &&
        (ticket as Record<string, any>)[field] !== (body as Record<string, any>)[field]
      ) {
        changes[field] = { from: (ticket as Record<string, any>)[field], to: (body as Record<string, any>)[field] };
        (ticket as Record<string, any>)[field] = (body as Record<string, any>)[field];
      }
    });

    // Actualiza history
    if (!ticket.history) ticket.history = [];
    if (Object.keys(changes).length > 0) {
      ticket.history.push({
        action: "edit",
        userId: body.userId,
        timestamp: new Date().toISOString(),
        details: changes,
      });
    }

    await ticketRepo.save(ticket);
    return { success: true, message: "Ticket updated successfully", data: ticket };
  }

  /**
   * Delete a ticket (only if owner).
   */
  @Post("tickets/delete")
  @ApiExcludeEndpoint()
  @UseGuards(AuthenticatedGuard)
  async deleteTicket(@Req() req: any, @Body("id") id: string) {
    const userId = req.user?.id;
    const user = await this.userRepository
      .createQueryBuilder("user")
      .where(`"user"."discordInfo"->>'id' = :id`, { id: userId })
      .andWhere(`"user"."deletedAt" IS NULL`)
      .getOne();
    if (!user) throw new HttpException("User not found", HttpStatus.NOT_FOUND);

    const ticketRepo = this.userRepository.manager.getRepository(TicketEntity);
    const ticket = await ticketRepo.findOne({ where: { id, userId: user.uuid } });
    if (!ticket) throw new HttpException("Ticket not found", HttpStatus.NOT_FOUND);

    await ticketRepo.remove(ticket);
    user.tickets = Array.isArray(user.tickets) ? user.tickets : [];
    user.tickets = user.tickets.filter((t) => t.id !== id);
    await this.userRepository.save(user);

    return { success: true, deleted: true };
  }

  /**
   * Send a message to a ticket chat.
   * Adds a message to the ticket's messages array.
   * Attachments are not implemented in this example.
   */
  @Post("tickets/messages/send")
  @ApiExcludeEndpoint()
  @UseGuards(AuthenticatedGuard)
  async sendTicketMessage(@Req() req: any, @Body() body: { ticketId: string; message: string }) {
    const userId = req.user?.id;
    const user = await this.userRepository
      .createQueryBuilder("user")
      .where(`"user"."discordInfo"->>'id' = :id`, { id: userId })
      .andWhere(`"user"."deletedAt" IS NULL`)
      .getOne();
    if (!user) throw new HttpException("User not found", HttpStatus.NOT_FOUND);

    const ticketRepo = this.userRepository.manager.getRepository(TicketEntity);
    const ticket = await ticketRepo.findOne({ where: { id: body.ticketId, userId: user.uuid } });
    if (!ticket) throw new HttpException("Ticket not found", HttpStatus.NOT_FOUND);

    // Message to add
    const newMsg = {
      id: Math.random().toString(36).slice(2, 10),
      user: {
        id: user.uuid,
        discordId: user.discordInfo?.id || "",
        name: user.name || user.discordInfo?.username || "User",
        avatar: req.user.avatar || user.discordInfo?.avatar || "",
        role: user.role || "User",
        roleColor: "#43b581",
      },
      message: body.message,
      createdAt: new Date().toLocaleString(),
      attachments: [],
    };

    // Initialize messages array if not present
    ticket.messages = Array.isArray(ticket.messages) ? ticket.messages : [];
    ticket.messages.push(newMsg);

    await ticketRepo.save(ticket);

    return { success: true, message: "Message sent.", msg: newMsg };
  }

  /**
   * Send a message to a ticket chat (Admin).
   * Adds a message to the ticket's messages array, accessible by admin.
   * Attachments are not implemented in this example.
   */
  @Post("tickets/messages/send-admin")
  @ApiExcludeEndpoint()
  @UseGuards(AuthenticatedGuard)
  async sendTicketMessageAdmin(@Body() body: { ticketUuid: string; message: string; userId: string }) {
    const ticketRepo = this.userRepository.manager.getRepository(TicketEntity);
    const ticket = await ticketRepo.findOne({ where: { uuid: body.ticketUuid } });
    if (!ticket) throw new HttpException("Ticket not found", HttpStatus.NOT_FOUND);

    const user = await this.userRepository.findOne({ where: { uuid: ticket.userId } });
    if (!user) throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    const newMsg = {
      id: Math.random().toString(36).slice(2, 10),
      user: {
        id: user.uuid,
        discordId: user.discordInfo?.id || "",
        name: "Admin",
        avatar: user.discordInfo?.avatar || "", // Admin avatar si es necesario
        role: "Admin",
        roleColor: "#f04747",
      },
      message: body.message,
      createdAt: new Date().toLocaleString(),
      attachments: [],
    };

    // Initialize messages array if not present
    ticket.messages = Array.isArray(ticket.messages) ? ticket.messages : [];
    ticket.messages.push(newMsg);

    await ticketRepo.save(ticket);

    return { success: true, message: "Message sent.", msg: newMsg };
  }

  /**
   * Get all messages for a ticket.
   * Returns the messages array for the given ticket.
   */
  @Get("tickets/messages/:ticketId")
  @ApiExcludeEndpoint()
  @UseGuards(AuthenticatedGuard)
  async getTicketMessages(@Req() req: any, @Body() _body: any, @Param("ticketId") ticketId: string) {
    const userId = req.user?.id;
    const user = await this.userRepository
      .createQueryBuilder("user")
      .where(`"user"."discordInfo"->>'id' = :id`, { id: userId })
      .andWhere(`"user"."deletedAt" IS NULL`)
      .getOne();
    if (!user) throw new HttpException("User not found", HttpStatus.NOT_FOUND);

    const ticketRepo = this.userRepository.manager.getRepository(TicketEntity);
    const ticket = await ticketRepo.findOne({ where: { id: ticketId, userId: user.uuid } });
    if (!ticket) throw new HttpException("Ticket not found", HttpStatus.NOT_FOUND);

    return { messages: Array.isArray(ticket.messages) ? ticket.messages : [], userId };
  }

  /**
   * Get all messages for a ticket (Admin).
   * Returns the messages array for the given ticket, accessible by admin.
   */
  @Get("tickets/messages-admin/:ticketUuid")
  @ApiExcludeEndpoint()
  @UseGuards(AuthenticatedGuard)
  async getTicketMessagesAdmin(@Param("ticketUuid") ticketUuid: string) {
    const ticketRepo = this.userRepository.manager.getRepository(TicketEntity);
    const ticket = await ticketRepo.findOne({ where: { uuid: ticketUuid } });
    if (!ticket) throw new HttpException("Ticket not found", HttpStatus.NOT_FOUND);

    const user = await this.userRepository.findOne({ where: { uuid: ticket.userId } });
    if (!user) throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    return {
      messages: Array.isArray(ticket.messages) ? ticket.messages : [],
      avatarUrl: `https://cdn.discordapp.com/avatars/${user.discordInfo?.id}/${user.discordInfo?.avatar}.png`,
    };
  }

  @Get("tickets/history/:ticketUuid")
  @ApiExcludeEndpoint()
  @UseGuards(AuthenticatedGuard)
  async getTicketHistoryAdmin(@Param("ticketUuid") ticketUuid: string) {
    const ticketRepo = this.userRepository.manager.getRepository(TicketEntity);
    const ticket = await ticketRepo.findOne({ where: { uuid: ticketUuid } });
    if (!ticket) throw new HttpException("Ticket not found", HttpStatus.NOT_FOUND);

    return { history: Array.isArray(ticket.history) ? ticket.history : [] };
  }

  /**
   * Export tickets and messages in PDF or CSV format.
   *
   * This endpoint allows exporting tickets with their messages in either CSV or PDF format.
   * It accepts advanced filters similar to `/tickets/search` and a format specifier ("pdf" or "csv").
   *
   * @param _req - The request object (not used).
   * @param body - The export options, including format and filters.
   * @returns {Promise<{ filename: string; contentType: string; data: string }>} The exported file data.
   *
   * @example
   * // Export tickets as CSV:
   * fetch('/dashboard/utils/tickets/export', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ format: 'csv', filters: { status: 'open' } })
   * })
   *   .then(res => res.json())
   *   .then(file => {
   *     // file.filename, file.contentType, file.data
   *   });
   *
   * @see {@link https://docs.nestjs.com/controllers NestJS Controllers Documentation}
   * @see {@link https://typeorm.io/#/select-query-builder TypeORM QueryBuilder}
   */
  @Post("tickets/export")
  @ApiExcludeEndpoint()
  @UseGuards(AuthenticatedGuard)
  async exportTickets(
    @Req() _req: any,
    @Body()
    body: {
      format: "pdf" | "csv";
      filters?: Partial<TicketExportFilters>;
    },
  ) {
    // Reutiliza la lógica de búsqueda avanzada
    const qb = this.userRepository.manager.getRepository(TicketEntity).createQueryBuilder("ticket");
    const filters = body.filters || {};

    if (filters.userId) qb.andWhere("ticket.userId = :userId", { userId: filters.userId });
    if (filters.assignedTo) qb.andWhere("ticket.assignedTo = :assignedTo", { assignedTo: filters.assignedTo });
    if (filters.category) qb.andWhere("ticket.category = :category", { category: filters.category });
    if (filters.status) qb.andWhere("ticket.status = :status", { status: filters.status });
    if (filters.customStatus) qb.andWhere("ticket.customStatus = :customStatus", { customStatus: filters.customStatus });
    if (filters.tags && filters.tags.length > 0) {
      qb.andWhere(
        filters.tags.map((_, i) => `ticket.tags LIKE :tag${i}`).join(" OR "),
        Object.fromEntries(filters.tags.map((tag, i) => [`tag${i}`, `%${tag}%`])),
      );
    }
    if (filters.keywords) {
      qb.andWhere("(ticket.title ILIKE :kw OR ticket.description ILIKE :kw)", { kw: `%${filters.keywords}%` });
    }
    if (filters.dateFrom) qb.andWhere("ticket.createdAt >= :dateFrom", { dateFrom: filters.dateFrom });
    if (filters.dateTo) qb.andWhere("ticket.createdAt <= :dateTo", { dateTo: filters.dateTo });
    if (filters.uuid) qb.andWhere("ticket.uuid = :ticketUuid", { ticketUuid: filters.uuid });

    qb.orderBy("ticket.createdAt", "DESC");
    const tickets = await qb.getMany();

    // Generates a simple CSV export of tickets.
    // The header defines the exported columns.
    if (body.format === "csv") {
      const header = [
        "id",
        "userId",
        "title",
        "description",
        "status",
        "priority",
        "category",
        "tags",
        "assignedTo",
        "customStatus",
        "createdAt",
        "updatedAt",
      ];
      // Maps each ticket to a CSV row.
      const rows = tickets.map((t) =>
        header
          .map((h) => {
            switch (h) {
              case "id":
                return t.id ?? "";
              case "userId":
                return t.userId ?? "";
              case "title":
                return t.title ?? "";
              case "description":
                return t.description ?? "";
              case "status":
                return t.status ?? "";
              case "priority":
                return t.priority ?? "";
              case "category":
                return t.category ?? "";
              case "tags":
                return Array.isArray(t.tags) ? t.tags.join("|") : "";
              case "assignedTo":
                return t.assignedTo ?? "";
              case "customStatus":
                return t.customStatus ?? "";
              case "createdAt":
                return t.createdAt ? (t.createdAt.toISOString?.() ?? t.createdAt) : "";
              case "updatedAt":
                return t.updatedAt ? (t.updatedAt.toISOString?.() ?? t.updatedAt) : "";
              default:
                return "";
            }
          })
          .join(","),
      );
      const csv = [header.join(","), ...rows].join("\n");
      return {
        filename: `tickets_export_${Date.now()}.csv`,
        contentType: "text/csv",
        data: csv,
      };
    }

    /**
     * Generates a simple PDF export of tickets.
     * Note: This implementation returns plain text for demonstration purposes.
     * In production, use a library such as [pdfkit](https://github.com/foliojs/pdfkit) to generate a real PDF buffer.
     *
     * @example
     * // Export tickets as PDF:
     * fetch('/dashboard/utils/tickets/export', {
     *   method: 'POST',
     *   headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify({ format: 'pdf', filters: { status: 'open' } })
     * })
     *   .then(res => res.json())
     *   .then(file => {
     *     // file.filename, file.contentType, file.data
     *   });
     */
    if (body.format === "pdf") {
      const pdfText = tickets
        .map(
          (t) =>
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            `Ticket: ${t.title}\nID: ${t.id}\nUser: ${t.userId}\nStatus: ${t.status}\nPriority: ${t.priority}\nCategory: ${t.category}\nTags: ${(t.tags ?? []).join(", ")}\nAssigned: ${t.assignedTo}\nCustomStatus: ${t.customStatus}\nCreated: ${t.createdAt}\nUpdated: ${t.updatedAt}\n---\n`,
        )
        .join("\n");
      return {
        filename: `tickets_export_${Date.now()}.pdf`,
        contentType: "application/pdf",
        data: pdfText, // In production, return a real PDF buffer.
      };
    }

    throw new HttpException("Unsupported format", HttpStatus.BAD_REQUEST);
  }

  /**
   * Checks if the user is an admin.
   *
   * This endpoint verifies if the authenticated user has an admin role.
   * If not, it redirects to the logout page.
   *
   * @param req - The request object containing user information.
   * @param res - The response object for redirection if not an admin.
   * @returns {Promise<boolean>} True if the user is an admin, false otherwise.
   *
   * @example
   * fetch('/dashboard/utils/is-admin')
   *   .then(res => res.json())
   *   .then(isAdmin => {
   *     if (isAdmin) {
   *       // User is admin
   *     } else {
   *       // User is not admin
   *     }
   *   });
   *
   * @see {@link https://docs.nestjs.com/controllers NestJS Controllers Documentation}
   */
  @Get("is-admin")
  @ApiExcludeEndpoint()
  async isAdminUser(@Req() req: RequestClient, @Res() res: Response) {
    const userId = req.user.id;
    const user = await this.userRepository
      .createQueryBuilder("user")
      .where(`"user"."discordInfo"->>'id' = :id`, { id: userId })
      .andWhere(`"user"."deletedAt" IS NULL`)
      .getOne();

    if (!user) {
      this.logger.warn(`User with ID ${userId} not found`);
      res.redirect("/dashboard/logout");
      return false;
    }

    if (!user.role || !RolesAdmin.includes(user.role)) {
      this.logger.warn(`User with ID ${userId} does not have a valid role`);
      res.redirect("/dashboard/logout");
      return false;
    }

    this.logger.debug(`User with ID ${userId} is an admin`);
    return true;
  }

  /**
   * Creates a new license in the system.
   *
   * This endpoint allows admins to create a new software license for a user.
   * The payload must pass strict validation; errors are returned with clear messages.
   *
   * @param body - License creation data.
   * @returns {Promise<LicenseEntity>} The created license entity.
   *
   * @throws {HttpException} If the payload is invalid or creation fails.
   *
   * @example
   * fetch('/dashboard/utils/create-license', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({
   *     identifier: "LIC-12345",
   *     key: "ABCDEF123456",
   *     type: "basic",
   *     userId: "user-001",
   *     adminId: "admin-001",
   *     hwid: ["HWID-001"],
   *     requestLimit: 1000,
   *     validUntil: "2025-01-01T00:00:00Z",
   *     ips: ["192.168.1.1"],
   *     maxIps: 5
   *   })
   * })
   *   .then(res => res.json())
   *   .then(license => console.log(license));
   */
  @Post("create-license")
  @UseGuards(AuthenticatedGuard)
  @ApiExcludeEndpoint()
  async createLicense(@Body() body: any): Promise<LicenseEntity> {
    // Validate payload
    const validation = LicenceCreateSchema.safeParse(body);
    if (!validation.success) {
      this.logger.error("License creation validation failed", validation.error);
      throw new HttpException(`License creation failed: ${validation.error.message}`, HttpStatus.BAD_REQUEST);
    }

    const repo = this.userRepository.manager.getRepository(LicenseEntity);

    const existing = await repo.findOne({
      where: [{ key: validation.data.key }, { identifier: validation.data.identifier }],
    });
    if (existing) {
      this.logger.warn("License key or identifier already exists");
      throw new HttpException("License key or identifier already exists.", HttpStatus.CONFLICT);
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const license = repo.create(validation.data as LicenceCreateType);
      await repo.save(license);

      const user = await this.userRepository.findOne({ where: { uuid: body.userId } });
      if (user) {
        if (!user.licenses) user.licenses = [];
        user.licenses.push(license);
        await this.userRepository.save(user);
      }

      this.logger.debug(`License created successfully for user ${validation.data.userId}`);
      return license;
    } catch (err: any) {
      this.logger.error("Failed to create license", err);
      throw new HttpException(
        "Failed to create license. Please check your data and try again.",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Endpoint para autocompletado de usuarios y admins en el dashboard.
   * Devuelve un array de usuarios con uuid, name, role, email y discordInfo.
   *
   * @returns {Promise<Array<{ uuid: string; name: string; role: string; email: string; discordInfo: any }>>}
   *
   * @example
   * fetch('/dashboard/utils/all-users')
   *   .then(res => res.json())
   *   .then(users => { ... });
   */
  @Get("all-users")
  @ApiExcludeEndpoint()
  async getAllUsers(): Promise<Array<{ uuid: string; name: string; role: string; email: string; discordInfo: any }>> {
    const users = await this.userRepository.find({
      select: ["uuid", "name", "role", "email", "discordInfo"],
      where: { deletedAt: IsNull() },
      order: { name: "ASC" },
    });
    return users.map((u) => ({
      uuid: u.uuid,
      name: u.name,
      role: u.role,
      email: u.email,
      discordInfo: u.discordInfo,
    }));
  }
}
