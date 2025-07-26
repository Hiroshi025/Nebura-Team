import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/**
 * Guard that restricts access to routes for admin users only.
 *
 * This guard checks for the presence of a custom HTTP header `x-admin` and validates
 * its value against a secret key stored in the application's configuration.
 * If the header is missing or invalid, access is denied and a warning is logged.
 *
 * @example
 * // Usage in a controller
 * import { UseGuards, Controller, Get } from '@nestjs/common';
 * import { AdminGuard } from './guards/admin.guard';
 *
 * @Controller('admin')
 * @UseGuards(AdminGuard)
 * export class AdminController {
 *   @Get()
 *   getAdminData() {
 *     return 'This route is protected by AdminGuard';
 *   }
 * }
 *
 * @see {@link https://docs.nestjs.com/guards NestJS Guards Documentation}
 * @see {@link https://docs.nestjs.com/techniques/configuration NestJS Configuration}
 */
@Injectable()
export class AdminGuard implements CanActivate {
  /**
   * Logger instance for the AdminGuard.
   * Used to log warnings when access is denied.
   */
  private readonly logger = new Logger(AdminGuard.name);

  /**
   * Creates an instance of AdminGuard.
   * @param config The ConfigService instance used to access environment variables.
   */
  constructor(private readonly config: ConfigService) {}

  /**
   * Determines whether the current request is allowed to proceed.
   *
   * Checks for the presence of the `x-admin` header and validates it against
   * the `ADMIN_KEY_SECRET` value from the configuration.
   *
   * @param context The execution context of the request.
   * @returns `true` if the request is authorized as admin, `false` otherwise.
   *
   * @example
   * // Sending a request with the correct admin header using curl:
   * // curl -H "x-admin: <your-admin-secret>" http://localhost:3000/admin
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const adminHeader = request.headers["x-admin"];
    if (!adminHeader) {
      this.logger.warn("Access denied: No admin header present");
      return false;
    }

    const secretAdminKey = this.config.get<string>("ADMIN_KEY_SECRET")
      ? this.config.get<string>("ADMIN_KEY_SECRET")
      : process.env.ADMIN_KEY_SECRET;
    if (adminHeader !== secretAdminKey) {
      this.logger.warn("Access denied: Invalid admin header");
      return false;
    }
    return true;
  }
}
