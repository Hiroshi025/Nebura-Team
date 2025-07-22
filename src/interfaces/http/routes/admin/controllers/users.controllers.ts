import { Roles } from "#common/decorators/role.decorator";
import { RoleGuard } from "#common/guards/role.guard";
import { UserRole } from "#common/typeRole";
/* eslint-disable prettier/prettier */
import { UserEntity } from "#entity/auth/user.entity";
import { UserService } from "#routes/users/users.service";
import z, { object } from "zod";

import {
	BadRequestException, Body, Controller, Delete, Get, NotFoundException, Post, Query,
	UnauthorizedException, UseGuards
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

/**
 * AdminController
 *
 * Controller for administrative user management endpoints.
 * Provides endpoints for listing all users and updating user roles.
 *
 * Security:
 * - All endpoints require a valid Bearer token for authentication.
 * - Intended for use by admin-level users.
 *
 * @see https://docs.nestjs.com/controllers
 */
@UseGuards(AuthGuard("jwt"), RoleGuard)
@ApiTags("admin")
@ApiBearerAuth()
@Controller({
  path: "admin",
  version: "1",
})
export class AdminController {
  /**
   * Constructs the AdminController.
   *
   * @param userService - The service responsible for user operations.
   */
  constructor(private readonly userService: UserService) {}

  /**
   * Retrieves a list of all users in the system.
   *
   * @returns An array of user entities.
   */
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
  @Get("users")
  async findAll() {
    return this.userService.findAll();
  }

  /**
   * Deletes all users in the system.
   *
   * @returns An object indicating success and a message.
   * @throws {HttpException} If the deletion operation fails.
   */
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
  @Delete("users")
  async deleteAll(@Query("uuid") uuid: string) {
    // Validate the UUID format using Zod
    const validZod = object({
      uuid: z.uuid(),
    });

    const result = validZod.safeParse({ uuid });
    if (!result.success)
      throw new BadRequestException(result.error.message, {
        cause: result.error,
        description: "Invalid UUID format",
      });

    const adminUser = await this.userService.findByUuid(uuid);
    if (!adminUser)
      throw new NotFoundException("Admin user not found", {
        cause: new Error("Admin user not found"),
        description: "Admin user not found",
      });

    const roleValid = process.env.ADMIN_ROLE_PERMISSION;
    if (adminUser.role !== roleValid)
      throw new UnauthorizedException("Unauthorized", {
        cause: new Error("Unauthorized"),
        description: "User does not have permission to delete all users",
      });

    await this.userService.deleteAll(uuid);
    return {
      success: true,
      message: "All users deleted successfully",
    };
  }

  /**
   * Updates the role of a specific user.
   *
   * Expects a request body containing the user's UUID and the new role.
   * Validates the input using Zod before proceeding.
   *
   * @param userData - Partial user entity containing at least `uuid` and `role`.
   * @returns An object indicating success and the updated user data.
   * @throws {HttpException} If validation fails or the update operation fails.
   *
   * Example request body:
   * {
   *   "uuid": "user-uuid-string",
   *   "role": "admin" // or "user", "developer", "moderator", "client"
   * }
   *
   * @see https://docs.nestjs.com/controllers#request-payloads
   * @see https://zod.dev/
   */
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
  @Post("users/update-role")
  async roleUpdate(@Body() userData: Partial<UserEntity>): Promise<{ success: boolean; message: string; data: UserEntity }> {
    // Zod schema for validating the request body
    const validZod = object({
      uuid: z.uuid(),
      role: z.enum(["admin", "user", "developer", "moderator", "client"]),
    });

    const result = validZod.safeParse({ uuid: userData.uuid, role: userData.role });
    if (!result.success)
      throw new BadRequestException(result.error.message, {
        cause: result.error,
        description: "Invalid input data",
      });

    return {
      success: true,
      message: "Role updated successfully",
      data: await this.userService.updateRole(userData),
    };
  }
}
