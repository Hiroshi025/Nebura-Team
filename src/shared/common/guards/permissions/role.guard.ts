/**
 * @fileoverview
 * Implements a role-based authorization guard for NestJS routes.
 * Uses custom metadata to restrict access to routes based on user roles.
 *
 * @see [NestJS Guards Documentation](https://docs.nestjs.com/guards)
 * @see [NestJS Custom Decorators](https://docs.nestjs.com/custom-decorators)
 *
 * @example
 * // Usage in a controller:
 *
 * import { SetMetadata, UseGuards } from '@nestjs/common';
 * import { RoleGuard } from './role.guard';
 *
 * @SetMetadata('roles', ['admin'])
 * @UseGuards(RoleGuard)
 * @Get('admin')
 * getAdminResource() {
 *   // Only accessible by users with 'admin' role
 * }
 */

import { ROLES_KEY } from "#common/decorators/role.decorator";
import { Observable } from "rxjs";

import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

/**
 * Guard that restricts access to routes based on user roles.
 *
 * Retrieves the required roles from route metadata and compares them to the user's role.
 * If no roles are defined, access is granted by default.
 *
 * @class
 * @implements {CanActivate}
 *
 * @example
 * // Apply to a route:
 * @SetMetadata('roles', ['admin'])
 * @UseGuards(RoleGuard)
 * @Get('admin')
 * getAdminResource() {}
 */
@Injectable()
export class RoleGuard implements CanActivate {
  /**
   * Logger instance for RoleGuard.
   * @private
   */
  private readonly logger = new Logger(RoleGuard.name);

  /**
   * Creates an instance of RoleGuard.
   *
   * @param reflector - Used to retrieve metadata set by custom decorators.
   */
  constructor(private reflector: Reflector) {}

  /**
   * Determines if the current user can activate the route based on their role.
   *
   * @param context - The execution context for the request.
   * @returns {boolean | Promise<boolean> | Observable<boolean>} True if access is allowed, false otherwise.
   *
   * @example
   * // This method is called automatically by NestJS when a guarded route is accessed.
   */
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!roles || roles.length === 0) {
      this.logger.warn("No roles defined for this route, access granted by default");
      return true;
    }

    if (!user || !user.role) {
      this.logger.warn("User not authenticated or role not found");
      return false;
    }

    const valid = roles.includes(user.role as string);
    if (!valid) {
      this.logger.warn(`Access denied for user with role '${user.role}'. Required roles: ${roles.join(", ")}`);
      return false;
    }

    return true;
  }
}
