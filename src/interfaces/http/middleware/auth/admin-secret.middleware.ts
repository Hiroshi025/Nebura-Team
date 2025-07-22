import { NextFunction, Response } from "express";

import { HttpException, HttpStatus, Injectable, Logger, NestMiddleware } from "@nestjs/common";

import type { Request } from "express-serve-static-core";

/**
 * AdminRoleMiddleware
 *
 * This middleware restricts access to certain HTTP routes by validating a custom admin key
 * provided in the request headers. Only requests that include a valid admin key (matching the
 * value of the ADMIN_KEY_SECRET environment variable) in the "x-admin-key" header are allowed
 * to proceed. All other requests are denied with a 403 Forbidden error.
 *
 * Usage:
 * - Attach this middleware to routes that require admin-level access.
 * - The client must include the "x-admin-key" header with the correct secret value.
 *
 * Security:
 * - The admin key should be kept secret and rotated periodically.
 * - This middleware does not check user roles or authentication; it only validates the admin key.
 *
 * Example:
 * ```
 * // In your module or route configuration:
 * app.use('/admin', AdminRoleMiddleware);
 * ```
 *
 * @see https://docs.nestjs.com/middleware
 * @see https://docs.nestjs.com/guards
 */
@Injectable()
export class AdminSecretMiddleware implements NestMiddleware {
  /**
   * Logger instance for logging unauthorized access attempts and errors.
   */
  private readonly logger = new Logger(AdminSecretMiddleware.name);

  /**
   * Middleware execution method.
   *
   * Validates the presence and correctness of the "x-admin-key" header in the incoming request.
   * If the key matches the configured secret, the request proceeds to the next middleware or handler.
   * Otherwise, a 403 Forbidden error is thrown and the attempt is logged.
   *
   * @param req - The incoming HTTP request object.
   * @param _res - The HTTP response object (unused).
   * @param next - The next middleware function in the request pipeline.
   * @throws {HttpException} Throws a 403 Forbidden error if the admin key is missing or invalid.
   */
  use(req: Request, _res: Response, next: NextFunction) {
    try {
      // Retrieve the admin key from environment and request header
      const configKey = process.env.ADMIN_KEY_SECRET;
      const headerKey = req.headers["x-admin-key"];

      // Validate the admin key
      if (configKey !== headerKey) {
        this.logger.warn("Unauthorized access attempt: Invalid admin key");
        throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
      }

      next();
    } catch (error) {
      this.logger.error("Admin role validation failed", error instanceof Error ? error.message : String(error));
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    }
  }
}
