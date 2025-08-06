import { NextFunction } from "express";
import { Request, Response } from "express-serve-static-core";

import { Injectable, Logger, NestMiddleware } from "@nestjs/common";

/**
 * Middleware that redirects unauthenticated users to the Discord login page.
 *
 * This middleware checks if the request is authenticated using `req.isAuthenticated()`.
 * If the user is not authenticated, they are redirected to `/auth/discord/login`.
 * Otherwise, the request proceeds to the next middleware or handler.
 *
 * @example
 * // Usage in NestJS module
 * import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
 * import { RedirectIfNotAuthenticatedMiddleware } from './auth-discord.middleware';
 *
 * @Module({  })
 * export class AppModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer
 *       .apply(RedirectIfNotAuthenticatedMiddleware)
 *       .forRoutes({ path: 'protected', method: RequestMethod.ALL });
 *   }
 * }
 *
 * @see {@link https://docs.nestjs.com/middleware NestJS Middleware}
 * @see {@link https://github.com/jaredhanson/passport Passport.js}
 */
@Injectable()
export class RedirectIfNotAuthenticatedMiddleware implements NestMiddleware {
  /**
   * Logger instance for this middleware.
   */
  private readonly logger = new Logger(RedirectIfNotAuthenticatedMiddleware.name);

  /**
   * Creates a new instance of RedirectIfNotAuthenticatedMiddleware.
   */
  constructor() {}

  /**
   * Checks authentication and redirects if necessary.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @param next - The next middleware function.
   * @returns Redirects to Discord login if not authenticated, otherwise calls next().
   *
   * @example
   * // Will redirect unauthenticated users
   * middleware.use(req, res, next);
   */
  use(req: Request, res: Response, next: NextFunction) {
    this.logger.debug(`Checking authentication for request: ${req.method} ${req.originalUrl}`);
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.redirect("/auth/discord/login");
    }
    next();
  }
}
