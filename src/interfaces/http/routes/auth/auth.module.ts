import { JwtConfigModule } from "#/jwt.module";
import { JwtStrategy } from "#adapters/database/strategy/jwt.strategy";
import { LocalStrategy } from "#adapters/database/strategy/local.strategy";
import { UserEntity } from "#entity/auth/user.entity";

import { Module, NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthController } from "../../controllers/auth/auth.controllers";
import { AuthService } from "./auth.service";

/**
 * Authentication module for handling user authentication logic.
 *
 * This module sets up the necessary providers, controllers, and middleware for authentication.
 * It registers the {@link AuthService}, {@link AuthController}, and applies {@link AuthMiddleware}
 * to the "auth/me" GET route.
 *
 * @see {@link https://docs.nestjs.com/modules NestJS Modules}
 * @see {@link https://docs.nestjs.com/middleware NestJS Middleware}
 * @see {@link https://docs.nestjs.com/techniques/database NestJS TypeORM}
 */
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), JwtConfigModule],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule implements NestModule {
  /**
   * Configures middleware for the module.
   *
   * Applies {@link AuthMiddleware} to the "auth/me" GET route to ensure authentication.
   *
   * @param consumer MiddlewareConsumer instance for configuring middleware.
   *
   * @see {@link https://docs.nestjs.com/middleware#applying-middleware Applying Middleware}
   */
  configure() {}
}
