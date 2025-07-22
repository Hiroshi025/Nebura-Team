import { SetMetadata } from "@nestjs/common";

/**
 * The key used to store roles metadata on route handlers.
 *
 * @constant
 * @type {string}
 * @default "roles"
 *
 * @see [NestJS Custom Decorators](https://docs.nestjs.com/custom-decorators)
 */
export const ROLES_KEY: string = "roles";

/**
 * Custom decorator to specify required roles for route handlers.
 *
 * Attaches an array of roles to the route's metadata, which can be accessed by guards (e.g., RoleGuard)
 * to enforce role-based access control.
 *
 * @param {...string[]} roles - One or more roles required to access the route.
 * @returns {CustomDecorator<string[]>} A decorator function to set roles metadata.
 *
 * @example
 * // Restrict route to 'admin' and 'manager' roles
 * @Roles('admin', 'manager')
 * @Get('admin-resource')
 * getAdminResource() {
 *   // Only accessible by users with 'admin' or 'manager' roles
 * }
 *
 * @see [NestJS Guards and Authorization](https://docs.nestjs.com/guards)
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
