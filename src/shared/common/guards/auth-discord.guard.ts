import { UserEntity } from "#entity/users/user.entity";
import { Repository } from "typeorm";

import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";

/**
 * Guard that integrates Discord authentication using Passport.js.
 *
 * This guard triggers the Discord OAuth2 flow and ensures the user is logged in.
 *
 * @example
 * // Usage in a controller
 * @UseGuards(DiscordAuthGuard)
 * @Get('discord/login')
 * async discordLogin() {
 *   // Your login logic
 * }
 *
 * @see {@link https://docs.nestjs.com/security/authentication NestJS Authentication}
 * @see {@link https://github.com/jaredhanson/passport-discord Passport-Discord}
 */
@Injectable()
export class DiscordAuthGuard extends AuthGuard("discord") {
  /**
   * Activates the Discord authentication guard.
   * Calls the parent canActivate and logIn methods.
   *
   * @param context - The execution context of the request.
   * @returns A boolean indicating if the guard allows activation.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const activate = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();
    await super.logIn(request);
    return activate;
  }
}

/**
 * Guard that checks if the user is authenticated in the current session.
 *
 * Useful for protecting routes that require an active authenticated session.
 *
 * @example
 * // Usage in a controller
 * @UseGuards(AuthenticatedGuard)
 * @Get('profile')
 * async getProfile() {
 *   // Only accessible if authenticated
 * }
 *
 * @see {@link https://docs.nestjs.com/guards NestJS Guards}
 */
@Injectable()
export class AuthenticatedGuard implements CanActivate {
  /**
   * Checks if the request is authenticated.
   *
   * @param context - The execution context of the request.
   * @returns True if the user is authenticated, false otherwise.
   */
  canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    return Promise.resolve(Boolean((req as { isAuthenticated?: () => boolean }).isAuthenticated?.()));
  }
}

@Injectable()
export class AuthAdminGuard implements CanActivate {
  private readonly logger = new Logger(AuthAdminGuard.name);
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  /**
   * Checks if the user has admin privileges.
   *
   * @param context - The execution context of the request.
   * @returns True if the user is an admin, false otherwise.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const user = req.user;

    const data = await this.userRepository
      .createQueryBuilder("user")
      .where(`"user"."discordInfo"->>'id' = :id`, { id: user.id })
      .andWhere(`"user"."deletedAt" IS NULL`)
      .getOne();

    if (!data) {
      this.logger.warn(`User with ID ${user.id} not found or deleted.`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      res.redirect("/dashboard/logout");
      return false;
    }

    const validrole = ["admin", "moderator", "developer", "owner"];
    if (validrole.includes(data.role)) {
      this.logger.log(`User with ID ${user.id} has valid role: ${data.role}`);
      return true;
    } else {
      this.logger.warn(`User with ID ${user.id} does not have admin privileges.`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      res.redirect("/dashboard/logout");
      return false;
    }
  }
}
