import { JwtConfigModule } from "#/core/jwt.module";
import { JwtStrategy } from "#common/strategies/jwt.strategy";
import { UserEntity } from "#entity/users/user.entity";

import { Module, NestModule } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthService } from "./auth.service";
import { AuthController } from "./controllers/auth.controller";
import { UserCreatedListener } from "./listeners/user-created.listener";

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
  providers: [AuthService, JwtStrategy, UserCreatedListener],
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
