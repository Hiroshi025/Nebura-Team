import { JwtConfigModule } from "#/jwt.module";
import { UserEntity } from "#entity/auth/user.entity";
import { UserService } from "#routes/users/users.service";

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AdminCacheController } from "../../controllers/admin/cache.controllers";
import { AdminController } from "../../controllers/admin/users.controllers";
import { CacheService } from "./cache.service";

/**
 * AdminModule is responsible for providing admin-related services and controllers.
 *
 * This module integrates the UserEntity with TypeORM, provides the UserService,
 * and exposes the AdminController for handling HTTP requests related to administrative user management.
 *
 * Middleware is configured to protect all admin endpoints:
 * - AuthMiddleware ensures that requests are authenticated.
 * - AdminRoleMiddleware restricts access to users with admin-level roles ("admin", "developer", "moderator").
 *
 * @module AdminModule
 * @see {@link https://docs.nestjs.com/modules | NestJS Modules}
 * @see {@link https://docs.nestjs.com/middleware | NestJS Middleware}
 */
@Module({
  imports: [JwtConfigModule, TypeOrmModule.forFeature([UserEntity])],
  providers: [UserService, CacheService],
  controllers: [AdminController, AdminCacheController],
  exports: [UserService, CacheService],
})
export class AdminModule {
  /**
   * Configures middleware for all admin-related routes.
   *
   * The following middleware are applied to every endpoint in the AdminController:
   * - {@link AuthMiddleware}: Ensures the request is authenticated and attaches the user to the request object.
   * - {@link AdminRoleMiddleware}: Allows access only to users with roles "admin", "developer", or "moderator".
   *
   * @param consumer - The MiddlewareConsumer instance used to apply middleware to routes.
   * @see {@link https://docs.nestjs.com/middleware#applying-middleware | NestJS: Applying Middleware}
   */
  configure() {}
}
