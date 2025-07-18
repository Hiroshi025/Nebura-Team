import { AuthModule } from "#routes/auth/auth.module";
import { HealthModule } from "#routes/health/health.module";

import { CacheInterceptor, CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";

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
    /**
     * Configures TypeORM for PostgreSQL database connection.
     * @see {@link https://docs.nestjs.com/techniques/database TypeORM Integration}
     */
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      username: process.env.DB_USERNAME ? String(process.env.DB_USERNAME) : "",
      password: process.env.DB_PASSWORD ? String(process.env.DB_PASSWORD) : "",
      database: process.env.DB_NAME,
      entities: ["src/adapters/database/entity/*.ts"],
      synchronize: true,
      logging: true,
    }),
    /**
     * Sets up request rate limiting using ThrottlerModule.
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
     * Loads environment variables globally.
     * @see {@link https://docs.nestjs.com/techniques/configuration ConfigModule}
     */
    ConfigModule.forRoot({
      isGlobal: true,
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
     * Integrates health check endpoints.
     * @see {@link https://docs.nestjs.com/recipes/terminus HealthModule}
     */
    HealthModule,
    /**
     * Integrates authentication endpoints.
     * @see {@link https://docs.nestjs.com/security/authentication AuthModule}
     */
    AuthModule,
  ], // List of modules to import into the application.
  controllers: [], // List of controllers to register.
  providers: [
    /**
     * Registers ThrottlerGuard globally to protect all endpoints.
     * @see {@link https://docs.nestjs.com/security/rate-limiting ThrottlerGuard}
     */
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    /**
     * Registers CacheInterceptor globally to enable caching for all endpoints.
     * @see {@link https://docs.nestjs.com/techniques/caching Cache
     */
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ], // List of providers (services, etc.) to register.
})
export class AppModule {
  // No constructor or custom logic required for this module.
}
