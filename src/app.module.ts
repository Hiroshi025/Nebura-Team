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
import { ErrorHistoryModule } from "#routes/errors/error-history.module";
import { HealthModule } from "#routes/health/health.module";
import { HealthService } from "#routes/health/health.service";
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

/**
 * The root module of the application.
 *
 * This module is the entry point for the NestJS application and is responsible for
 * importing other modules, registering controllers, and providers.
 *
 * It configures the database connection using TypeORM, sets up request throttling
 * with {@link ThrottlerModule}, loads environment configuration with {@link ConfigModule},
 * and integrates health and authentication modules.
 *
 * @see {@link https://docs.nestjs.com/modules NestJS Modules}
 * @see {@link https://docs.nestjs.com/techniques/database NestJS TypeORM}
 * @see {@link https://docs.nestjs.com/techniques/configuration NestJS ConfigModule}
 * @see {@link https://docs.nestjs.com/security/rate-limiting NestJS Throttler}
 * @see {@link https://docs.nestjs.com/recipes/terminus NestJS Terminus}
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([StatusEntity, UserEntity, RequestStatEntity, LicenseEntity, NotificationEntity, TicketEntity]),
    /**
     * Configures TypeORM for PostgreSQL database connection.
     * @see {@link https://docs.nestjs.com/techniques/database TypeORM Integration}
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
     * Loads environment variables globally.
     * @see {@link https://docs.nestjs.com/techniques/configuration ConfigModule}
     */
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env", // Load environment variables from .env file
    }),
    /**
     * Registers the AuthModule for handling authentication.
     * @see {@link https://docs.nestjs.com/security/authentication AuthModule}
     */
    CacheModule.register({
      isGlobal: true, // Make cache available globally
      ttl: 5 * 60, // Cache time-to-live in seconds
      max: 100, // Maximum number of items in cache
    }),
    /**
     * Integrates the ThrottlerModule for request throttling.
     * @see {@link https://docs.nestjs.com/security/rate-limiting ThrottlerModule}
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
     * Configures TerminusModule with logging enabled.
     * @see {@link https://docs.nestjs.com/recipes/terminus#configuration Terminus Configuration}
     */
    TerminusModule.forRoot({
      logger: true,
    }),
    /**
     * Integrates the HttpModule for making HTTP requests.
     * @see {@link https://docs.nestjs.com/techniques/http HttpModule}
     */
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    /**
     * Integrates the EventEmitterModule for event-driven architecture.
     * @see {@link https://docs.nestjs.com/recipes/event-emitter EventEmitterModule}
     */
    EventEmitterModule.forRoot(),
    /**
     * Integrates the HealthModule for health checks.
     * @see {@link https://docs.nestjs.com/recipes/terminus HealthModule}
     */
    ScheduleModule.forRoot(),
    /**
     * Integrates health check endpoints.
     * @see {@link https://docs.nestjs.com/recipes/terminus HealthModule}
     */
    HealthModule,
    /**
     * Integrates authentication endpoints.
     * @see {@link https://docs.nestjs.com/security/authentication AuthModule}
     */
    AuthModule,
    /**
     * Integrates user management endpoints.
     * @see {@link https://docs.nestjs.com/modules UsersModule}
     */
    UsersModule,
    /**
     * Integrates admin management endpoints.
     * @see {@link https://docs.nestjs.com/modules AdminModule}
     */
    AdminModule,
    /**
     * Integrates error history management endpoints.
     * @see {@link https://docs.nestjs.com/modules ErrorHistoryModule}
     */
    ErrorHistoryModule,
    /**
     * Integrates client management endpoints.
     * @see {@link https://docs.nestjs.com/modules ClientModule}
     */
    ClientModule,
    /**
     * Integrates Discord client management.
     * @see {@link https://docs.nestjs.com/modules DiscordModule}
     */
    DiscordModule,
    /**
     * Integrates JWT configuration module.
     * @see {@link #core/jwt.module.ts JwtConfigModule}
     */
    JwtConfigModule,
  ], // List of modules to import into the application.
  controllers: [AppController, UtilsController], // List of controllers to register.
  providers: [
    /**
     * Provides the HealthService for health check functionality.
     * @see {@link #routes/health/health.service.ts HealthService}
     */
    HealthService,
    /**
     * Registers the ClientListener service to handle Discord client events.
     * @see {@link ./interfaces/mesagging/discord/client.module.ts ClientListener}
     */
    ClientListener,
    /**
     * Registers CacheInterceptor globally to enable caching for all endpoints.
     * @see {@link https://docs.nestjs.com/techniques/caching Cache
     */
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    /**
     * Registers LoggingInterceptor globally to log request lifecycle events.
     * @see {@link #common/interceptors/register.interceptor.ts LoggingInterceptor}
     */
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    /**
     * Registers ThrottlerGuard globally to enforce request rate limiting.
     * @see {@link https://docs.nestjs.com/security/rate-limiting ThrottlerGuard}
     */
    {
      provide: APP_GUARD,
      useClass: HttpThrottlerGuard,
    },
    /**
     * Registers ClientHeaderGuard globally to manage the `x-client-id` header.
     * @see {@link #common/guards/client-header.guard.ts ClientHeaderGuard}
     */
    {
      provide: APP_GUARD,
      useClass: ClientHeaderGuard,
    },
    /**
     * Registers RequestMetricsInterceptor globally to collect request metrics.
     * @see {@link #common/interceptors/request.interceptor.ts RequestMetricsInterceptor}
     */
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestMetricsInterceptor,
    },
  ], // List of providers (services, etc.) to register.
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IPBlockerMiddleware).forRoutes("*");
    consumer.apply(RedirectIfNotAuthenticatedMiddleware).forRoutes({ path: "dashboard", method: RequestMethod.GET });
  }
}
