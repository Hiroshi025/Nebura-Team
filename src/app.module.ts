import { StatusEntity } from "#adapters/database/entities/health/status.entity";
import { ClientHeaderGuard } from "#common/guards/client-header.guard";
import { HttpThrottlerGuard } from "#common/guards/http-throttler.guard";
import { LoggingInterceptor } from "#common/interceptors/register.interceptor";
import { RequestMetricsInterceptor } from "#common/interceptors/request.interceptor";
import { JwtConfigModule } from "#core/jwt.module";
import { IPBlockerEntity } from "#entity/admin/ips-blocker.entity";
import { OAuth2Credentials } from "#entity/users/auth/oauth2-credentials.entity";
import { SessionEntity } from "#entity/users/auth/session.entity";
import { TicketEntity } from "#entity/users/support/tickets.entity";
import { UserEntity } from "#entity/users/user.entity";
import { LicenseEntity } from "#entity/utils/licence.entity";
import { RequestStatEntity } from "#entity/utils/metrics/request.entity";
import { FileEntity } from "#entity/utils/tools/file.entity";
import { NotificationEntity } from "#entity/utils/tools/notification.entity";
import { AdminModule } from "#routes/admin/admin.module";
import { AuthModule } from "#routes/auth/auth.module";
import { ClientModule } from "#routes/client/client.module";
import { HealthModule } from "#routes/health/health.module";
import { HealthService } from "#routes/health/service/health.service";
import { UsersModule } from "#routes/users/users.module";
import { UtilsController } from "#routes/utils.controller";

import { HttpModule } from "@nestjs/axios";
import { CacheInterceptor, CacheModule } from "@nestjs/cache-manager";
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ScheduleModule } from "@nestjs/schedule";
import { TerminusModule } from "@nestjs/terminus";
import { ThrottlerModule } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ClientListener } from "./core/discord/listeners/client/client.listener";
import { DiscordModule } from "./core/discord/necord.module";
import {
	RedirectIfNotAuthenticatedMiddleware
} from "./interfaces/http/middleware/applications/auth-discord.middleware";
import { IPBlockerMiddleware } from "./interfaces/http/middleware/ip-blocker.middleware";
import { AppController } from "./interfaces/http/routes/app.controller";
import { ChatGateway } from "./interfaces/http/socket/chats.gateaway";

/**
 * The root module of the Nebura application.
 *
 * This module serves as the main entry point for the NestJS application.
 * It is responsible for importing feature modules, registering controllers, and providers.
 *
 * ## Features
 * - Configures PostgreSQL database connection using TypeORM.
 * - Loads environment variables globally using {@link https://docs.nestjs.com/techniques/configuration | ConfigModule}.
 * - Sets up request throttling with {@link https://docs.nestjs.com/security/rate-limiting | ThrottlerModule}.
 * - Integrates health checks, authentication, user management, admin, error history, client, Discord, and JWT modules.
 * - Registers global interceptors and guards for caching, logging, throttling, client header validation, and request metrics.
 * - Applies custom middlewares for IP blocking and Discord authentication.
 *
 * @example
 * // Main bootstrap in main.ts
 * async function bootstrap() {
 *   const app = await NestFactory.create(AppModule);
 *   await app.listen(3000);
 * }
 *
 * @see {@link https://docs.nestjs.com/modules | NestJS Modules}
 * @see {@link https://docs.nestjs.com/techniques/database | NestJS TypeORM}
 * @see {@link https://docs.nestjs.com/techniques/configuration | NestJS ConfigModule}
 * @see {@link https://docs.nestjs.com/security/rate-limiting | NestJS Throttler}
 * @see {@link https://docs.nestjs.com/recipes/terminus | NestJS Terminus}
 */
@Module({
  imports: [
    /**
     * Registers TypeORM entities for dependency injection.
     * @see {@link https://docs.nestjs.com/techniques/database | TypeORM Integration}
     */
    TypeOrmModule.forFeature([StatusEntity, UserEntity, RequestStatEntity, LicenseEntity, NotificationEntity, TicketEntity]),
    /**
     * Configures TypeORM for PostgreSQL database connection.
     * Environment variables are used for connection parameters.
     * @see {@link https://typeorm.io/#/connection-options | TypeORM Connection Options}
     */
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      username: process.env.DB_USERNAME ? String(process.env.DB_USERNAME) : "postgres",
      password: process.env.DB_PASSWORD ? String(process.env.DB_PASSWORD) : "luisP200",
      database: process.env.DB_NAME,
      entities: [
        UserEntity,
        StatusEntity,
        FileEntity,
        LicenseEntity,
        IPBlockerEntity,
        SessionEntity,
        OAuth2Credentials,
        RequestStatEntity,
        NotificationEntity,
        TicketEntity,
      ],
      synchronize: true,
      //logging: true,
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
      extra: {
        ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : null,
      },
    }),
    /**
     * Loads environment variables globally from .env file.
     * @see {@link https://docs.nestjs.com/techniques/configuration | ConfigModule}
     */
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    /**
     * Registers the global cache manager.
     * @see {@link https://docs.nestjs.com/techniques/caching | CacheModule}
     */
    CacheModule.register({
      isGlobal: true,
      ttl: 5 * 60,
      max: 100,
    }),
    /**
     * Integrates request throttling strategies.
     * @see {@link https://docs.nestjs.com/security/rate-limiting | ThrottlerModule}
     * @example
     * // Short: 3 requests per second
     * // Medium: 20 requests per 10 seconds
     * // Long: 100 requests per minute
     */
    ThrottlerModule.forRoot([
      {
        name: "short",
        ttl: 1000,
        limit: 3,
      },
      {
        name: "medium",
        ttl: 10000,
        limit: 20,
      },
      {
        name: "long",
        ttl: 60000,
        limit: 100,
      },
    ]),
    /**
     * Enables health check endpoints with logging.
     * @see {@link https://docs.nestjs.com/recipes/terminus#configuration | Terminus Configuration}
     */
    TerminusModule.forRoot({
      logger: true,
    }),
    /**
     * Integrates HTTP client module for outbound requests.
     * @see {@link https://docs.nestjs.com/techniques/http | HttpModule}
     */
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    /**
     * Enables event-driven architecture.
     * @see {@link https://docs.nestjs.com/recipes/event-emitter | EventEmitterModule}
     */
    EventEmitterModule.forRoot(),
    /**
     * Enables scheduled tasks.
     * @see {@link https://docs.nestjs.com/techniques/task-scheduling | ScheduleModule}
     */
    ScheduleModule.forRoot(),
    /**
     * Feature modules for application functionality.
     */
    HealthModule,
    AuthModule,
    UsersModule,
    AdminModule,
    ClientModule,
    DiscordModule,
    JwtConfigModule,
  ],
  /**
   * Application controllers.
   */
  controllers: [AppController, UtilsController],
  providers: [
    /**
     * Provides the ChatGateway for WebSocket communication.
     * @see {@link #interfaces/http/socket/chats.gateaway.ts | ChatGateway}
     */
    ChatGateway,
    /**
     * Provides the HealthService for health check functionality.
     * @see {@link #routes/health/health.service.ts | HealthService}
     */
    HealthService,
    /**
     * Registers the ClientListener service to handle Discord client events.
     * @see {@link ./core/discord/listeners/client/client.listener.ts | ClientListener}
     */
    ClientListener,
    /**
     * Registers CacheInterceptor globally to enable caching for all endpoints.
     * @see {@link https://docs.nestjs.com/techniques/caching | CacheInterceptor}
     */
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    /**
     * Registers LoggingInterceptor globally to log request lifecycle events.
     * @see {@link #common/interceptors/register.interceptor.ts | LoggingInterceptor}
     */
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    /**
     * Registers ThrottlerGuard globally to enforce request rate limiting.
     * @see {@link https://docs.nestjs.com/security/rate-limiting | ThrottlerGuard}
     */
    {
      provide: APP_GUARD,
      useClass: HttpThrottlerGuard,
    },
    /**
     * Registers ClientHeaderGuard globally to manage the `x-client-id` header.
     * @see {@link #common/guards/client-header.guard.ts | ClientHeaderGuard}
     */
    {
      provide: APP_GUARD,
      useClass: ClientHeaderGuard,
    },
    /**
     * Registers RequestMetricsInterceptor globally to collect request metrics.
     * @see {@link #common/interceptors/request.interceptor.ts | RequestMetricsInterceptor}
     */
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestMetricsInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  /**
   * Configures middlewares for the application.
   *
   * - Applies {@link IPBlockerMiddleware} to all routes for IP blocking.
   * - Applies {@link RedirectIfNotAuthenticatedMiddleware} to dashboard GET requests for Discord authentication.
   *
   * @param consumer MiddlewareConsumer instance for configuring middlewares.
   * @see {@link https://docs.nestjs.com/middleware | NestJS Middleware}
   * @example
   * consumer.apply(IPBlockerMiddleware).forRoutes("*");
   * consumer.apply(RedirectIfNotAuthenticatedMiddleware).forRoutes({ path: "dashboard", method: RequestMethod.GET });
   */
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IPBlockerMiddleware).forRoutes("*");
    consumer.apply(RedirectIfNotAuthenticatedMiddleware).forRoutes({ path: "dashboard", method: RequestMethod.GET });
  }
}
