
import { RequestClient } from "#/types/express";
import { AuthenticatedGuard } from "#common/guards/auth-discord.guard";
import { TicketEntity } from "#entity/users/tickets.entity";
import { UserEntity } from "#entity/users/user.entity";
import { LicenseEntity } from "#entity/utils/licence.entity";
import { RequestStatEntity } from "#entity/utils/request.entity";
import { Response } from "express-serve-static-core";
import os from "os";
import { firstValueFrom } from "rxjs";
import { IsNull, Not, Repository } from "typeorm";

import { HttpService } from "@nestjs/axios";
import { Controller, Get, Logger, Render, Req, Res, UseGuards } from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";
import { TypeOrmHealthIndicator } from "@nestjs/terminus";
import { InjectRepository } from "@nestjs/typeorm";

import { HealthService } from "./health/health.service";

/**
 * The main application controller.
 *
 * This controller handles the root route of the application and renders the index page,
 * passing health and error data to the view.
 *
 * @see {@link https://docs.nestjs.com/controllers NestJS Controllers Documentation}
 * @example
 * // Example usage in a browser:
 * // Visiting http://localhost:3000/ will render the index page with health and error data.
 */
@ApiExcludeController(true)
@Controller({
  path: "dashboard",
})
export class AppController {
  private readonly logger = new Logger(AppController.name);
  /**
   * Injects the HealthService to retrieve health and error data.
   * @param healthService The service used to get health and error information.
   */
  constructor(
    @InjectRepository(UserEntity)
    private readonly authRepository: Repository<UserEntity>,
    @InjectRepository(TicketEntity)
    private readonly ticketRepository: Repository<TicketEntity>,
    private readonly healthService: HealthService,
    private readonly httpService: HttpService,
    private db: TypeOrmHealthIndicator,
  ) {}

  /**
   * Handles GET requests to the root path ('/').
   *
   * Renders the 'index' view and passes a message, health data, and error history to the template.
   *
   * @returns An object containing a greeting message, health status, and error history.
   * @example
   * // Example response:
   * // { message: "Hello world!", health: {...}, errors: [...] }
   */
  @Get("status")
  @Render("status")
  async root() {
    const health = await this.healthService.checkHealth();
    const errors = await this.healthService.getErrorHistory();
    return {
      title: "Nebura Status",
      subtitle: "System Status",
      health,
      errors,
    };
  }

  /**
   * Handles GET requests to the '/playground' path.
   *
   * Renders the 'playground' view with a welcome message.
   *
   * @returns An object containing a title and a welcome message.
   * @example
   * // Example response:
   * // { title: "Nebura Playground", message: "Welcome to the Nebura Playground!" }
   */
  @Get("playground")
  @Render("playground")
  onPlayground() {
    return {
      url: "/api/v1/validate-licence?key=YOUR_KEY&identifier=YOUR_ID",
      title: "Nebura Playground",
      endpoint: "/api/v1/validate-licence",
      subtitle: "License Validation Playground",
    };
  }

  /**
   * Redirects to the documentation index page.
   *
   * This method handles GET requests to the '/docs' path and redirects the user
   * to the documentation index page.
   *
   * @param res The response object used to perform the redirect.
   * @example
   * // Example usage:
   * // Visiting http://localhost:3000/dashboard/docs will redirect to /docs/index.html
   */
  @Get("docs")
  redirectToIndex(@Res() res: Response) {
    res.redirect("/docs/index.html");
  }

  @Get("auth")
  @Render("auth")
  renderToAuth() {
    return {
      title: "Nebura Auth",
      subtitle: "Authentication",
      toLoginDiscord: `/auth/discord/login`,
      message: "Welcome to the Nebura Auth page!",
    };
  }

  @Get("logout")
  @Render("logout")
  renderToLogout() {
    return {
      title: "Nebura Logout",
      subtitle: "Logout",
      discordToInvite: "",
      message: "You have been logged out successfully.",
      toLoginDiscord: `/auth/discord/login`,
    };
  }

  /**
   * Renderiza el dashboard con datos de prueba.
   * Accede en: http://localhost:3000/dashboard/test?lang=es
   */
  @Get()
  @UseGuards(AuthenticatedGuard)
  @Render("dashboard")
  async renderToDashboard(@Req() req: RequestClient, @Res() res: Response) {
    const userAuth = req.user;
    if (!userAuth) {
      this.logger.warn("User not authenticated, redirecting to login.");
      res.redirect("/dashboard/logout");
    }

    const data = await this.authRepository
      .createQueryBuilder("user")
      .where(`"user"."discordInfo"->>'id' = :id`, { id: req.user?.id })
      .andWhere(`"user"."deletedAt" IS NULL`)
      .getOne();

    const userTickets = await this.ticketRepository.find({
      where: { userId: data?.uuid },
      order: { createdAt: "DESC" },
    });

    //format d, h, m, s
    const isHours = Math.round(os.uptime() * 100) / 100 / 60 / 60;
    const isDays = Math.floor(isHours / 24);
    const isHoursRemainder = Math.floor(isHours % 24);

    const checkIsDB = await this.db.pingCheck("database");
    const response = await firstValueFrom(
      this.httpService.get(`${process.env.DISCORD_API}guilds/${process.env.DISCORD_DEVELOPMENT_GUILD_ID}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
        },
      }),
    );

    return {
      title: "Nebura Dashboard",
      isRequestCount: await this.authRepository.manager.getRepository(RequestStatEntity).count(),
      isDatabase: checkIsDB.database.status === "up" ? "✔️ Online" : "❌ Offline",
      licenceToCount: await this.authRepository.manager
        .getRepository(UserEntity)
        .count({ where: { licenses: Not(IsNull()), uuid: data?.uuid } }),
      isTimeActive: `${isDays}d ${isHoursRemainder}h`,
      isUsers: await this.authRepository.count(),
      isIcon: `https://cdn.discordapp.com/icons/${process.env.DISCORD_DEVELOPMENT_GUILD_ID}/${response.data.icon}.png?size=2048`,
      metricsToClient: await this.authRepository.manager
        .getRepository(RequestStatEntity)
        .find({ where: { clientId: data?.uuid } }),
      user: { api: data, discord: userAuth },
      userTickets,
      licences: await this.authRepository.manager.getRepository(LicenseEntity).find(),
      users: await this.authRepository.manager.getRepository(UserEntity).find(),
      isLicences: await this.authRepository.manager.getRepository(LicenseEntity).find({ where: { userId: data?.uuid } }),
    };
  }
}
