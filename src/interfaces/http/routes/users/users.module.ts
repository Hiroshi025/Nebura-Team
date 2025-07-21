import { JwtConfigModule } from "#/jwt.module";
import { UserEntity } from "#entity/auth/user.entity";

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { PublicUserController } from "../../controllers/users/public.controllers";
import { UserService } from "./users.service";

/**
 * UsersModule is responsible for providing user-related services and controllers.
 *
 * This module imports the UserEntity for TypeORM integration, provides the UserService,
 * and exposes the PublicUserController for handling HTTP requests related to users.
 *
 * It also configures middleware for specific user routes.
 *
 * @see {@link https://docs.nestjs.com/modules NestJS Modules}
 * @see {@link https://docs.nestjs.com/middleware NestJS Middleware}
 */
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), JwtConfigModule],
  providers: [UserService],
  controllers: [PublicUserController],
  exports: [UserService],
})
export class UsersModule {
  /**
   * Configures middleware for specific user-related routes.
   *
   * The AuthMiddleware is applied to the following routes:
   * - GET /users/find-by-uuid (v1)
   * - GET /users/find-by-email (v1)
   *
   * @param consumer - The MiddlewareConsumer instance used to apply middleware.
   * @see {@link https://docs.nestjs.com/middleware#applying-middleware NestJS: Applying Middleware}
   */
  configure() {}
}
