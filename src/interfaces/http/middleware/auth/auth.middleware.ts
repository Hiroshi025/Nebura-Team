import { getToken } from "#shared/webToken";
import { NextFunction, Response } from "express";

import { HttpException, HttpStatus, Injectable, Logger, NestMiddleware } from "@nestjs/common";

import type { Request } from "express-serve-static-core";

/**
 * Extends the Express Request interface to include a user property.
 * This property will be populated by the authentication middleware if the request is authenticated.
 */
declare module "express-serve-static-core" {
  interface Request {
    user?: any; // Puedes reemplazar 'any' por el tipo de usuario que uses
  }
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  /**
   * Logger instance for logging messages related to authentication operations.
   * This logger is used to log debug, info, warning, and error messages.
   */
  private readonly logger = new Logger(AuthMiddleware.name);
  /**
   * Handles the authentication logic for incoming requests.
   *
   * @param req - The Express request object, extended to include a user property.
   * @param _res - The Express response object (unused).
   * @param next - The next middleware function in the chain.
   *
   * @throws {HttpException} Throws UNAUTHORIZED if the token is missing or invalid.
   * @throws {HttpException} Throws FORBIDDEN if the token is expired or invalid.
   */
  use(req: Request, _res: Response, next: NextFunction) {
    try {
      // Extract the Authorization header and retrieve the token (Bearer <token>)
      const authHeader = req.headers.authorization;
      const token = typeof authHeader === "string" ? authHeader.split(" ")[1] : undefined;

      if (!token) {
        throw new HttpException("Token not found", HttpStatus.UNAUTHORIZED);
      }

      // Validate and decode the token
      const user = getToken(token);
      if (!user) {
        throw new HttpException("Invalid or expired token", HttpStatus.FORBIDDEN);
      }

      // Attach the user object to the request
      req.user = user;
      next();
    } catch (error) {
      // Log the authentication error and throw an Unauthorized exception
      this.logger.error("Authentication error", error instanceof Error ? error.message : String(error));
      console.error(error);
      throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED);
    }
  }
}
