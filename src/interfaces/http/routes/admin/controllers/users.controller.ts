import { RoleSchema } from "#adapters/schemas/auth.schema";
import { UuidSchema, UuidType } from "#adapters/schemas/shared/uuid.schema";
import { Roles } from "#common/decorators/role.decorator";
import { AuthGuard } from "#common/guards/auth.guard";
import { ClientHeaderGuard } from "#common/guards/client-header.guard";
import { RoleGuard } from "#common/guards/permissions/role.guard";
import { UserRole } from "#common/typeRole";
import { UserEntity } from "#entity/users/user.entity";
import { UserService } from "#routes/users/service/users.service";
import { Repository } from "typeorm";

import { CacheInterceptor, CacheKey, CacheTTL } from "@nestjs/cache-manager";
import {
	BadRequestException, Body, Controller, Delete, Get, NotFoundException, Post, Query, UseGuards,
	UseInterceptors
} from "@nestjs/common";
import {
	ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags
} from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";

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
@UseGuards(AuthGuard, RoleGuard, ClientHeaderGuard)
@ApiTags("admin-users")
@ApiBearerAuth()
@Controller({
  path: "admin/users",
  version: "1",
})
export class AdminController {
  /**
   * Constructs the AdminController.
   *
   * @param userService - The service responsible for user operations.
   */
  constructor(
    @InjectRepository(UserEntity)
    private readonly authRepository: Repository<UserEntity>,
    private readonly userService: UserService,
  ) {}

  /**
   * Retrieves a list of all users in the system.
   *
   * @returns An array of user entities.
   */
  @Get("")
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
  @CacheTTL(60) // Cache for 60 seconds
  @UseInterceptors(CacheInterceptor)
  @CacheKey("admin:users:list")
  @ApiResponse({ status: 200, description: "List of all users retrieved successfully", type: [UserEntity] })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiOperation({
    summary: "Get all users",
    description: "Retrieves a list of all users in the system.",
  })
  async findAll() {
    return this.userService.findAll();
  }

  /**
   * Deletes all users in the system.
   *
   * @returns An object indicating success and a message.
   * @throws {HttpException} If the deletion operation fails.
   */
  @Delete("delete")
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
  @ApiResponse({ status: 200, description: "All users deleted successfully" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiOperation({
    summary: "Delete all users",
    description: "Deletes all users in the system. Requires admin privileges.",
  })
  @ApiQuery({ name: "uuid", type: String, required: true, description: "UUID of the user to delete" })
  async delete(@Query("uuid") uuid: UuidType) {
    const result = UuidSchema.safeParse(uuid);
    if (!result.success)
      throw new BadRequestException(result.error.message, {
        cause: result.error.message,
        description: "Invalid UUID format",
      });

    const user = await this.authRepository.findOne({ where: { uuid } });
    if (!user) {
      throw new NotFoundException(`User with UUID ${uuid} not found`, {
        cause: new Error("User not found"),
        description: "The user with the specified UUID does not exist.",
      });
    }

    await this.authRepository.delete({ uuid });
    return {
      success: true,
      message: "User deleted successfully",
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
  @Post("update-role")
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
  @ApiResponse({ status: 200, description: "User role updated successfully", type: UserEntity })
  @ApiResponse({ status: 400, description: "Bad request. Invalid input data." })
  @ApiOperation({ summary: "Update user role", description: "Updates the role of a specific user." })
  @ApiBody({
    description: "User data containing UUID and new role",
    type: () => RoleSchema,
  })
  async roleUpdate(@Body() userData: Partial<UserEntity>): Promise<{ success: boolean; message: string; data: UserEntity }> {
    const result = RoleSchema.safeParse({ uuid: userData.uuid, role: userData.role });
    if (!result.success)
      throw new BadRequestException(result.error.message, {
        cause: result.error.message,
        description: "Invalid input data",
      });

    const user = await this.userService.updateRole(userData);
    return {
      success: user ? true : false,
      message: user ? "User role updated successfully" : "User not found",
      data: user || null,
    };
  }

  /**
   * Converts a user to a client by setting `isClient` to true.
   *
   * @param body - Object containing the user's UUID.
   * @returns An object indicating success and the updated user data.
   * @throws {HttpException} If the user is not found or update fails.
   *
   * @example
   * // Request body:
   * // { "uuid": "user-uuid-string" }
   */
  @Post("convert-to-client")
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
  @ApiOperation({ summary: "Convert user to client", description: "Sets isClient=true for the specified user." })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        uuid: { type: "string", description: "UUID of the user to convert" },
      },
      required: ["uuid"],
    },
  })
  @ApiResponse({ status: 200, description: "User converted to client successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  async convertToClient(@Body("uuid") uuid: string) {
    const user = await this.userService.convertToClient(uuid);
    return {
      success: !!user,
      message: user ? "User converted to client successfully" : "User not found",
      data: user || null,
    };
  }
}
