import { JwtConfigModule } from "#/core/jwt.module";
import { IPBlockerEntity } from "#entity/admin/ips-blocker.entity";
import { UserEntity } from "#entity/users/user.entity";
import { LicenseEntity } from "#entity/utils/licence.entity";
import { UserService } from "#routes/users/service/users.service";

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AdminCacheController } from "./controllers/cache.controller";
import { AdminIPBlockerController } from "./controllers/ip.controller";
import { AdminLicenceController } from "./controllers/licence.controller";
import { AdminController } from "./controllers/users.controller";
import { CacheService } from "./service/cache.service";
import { IPBlockerService } from "./service/ip.service";
import { LicenceService } from "./service/licence.service";

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
  imports: [JwtConfigModule, TypeOrmModule.forFeature([UserEntity, LicenseEntity, IPBlockerEntity])],
  providers: [UserService, CacheService, LicenceService, IPBlockerService],
  controllers: [AdminController, AdminCacheController, AdminLicenceController, AdminIPBlockerController],
  exports: [UserService, CacheService, LicenceService, IPBlockerService],
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
