import { UuidSchema, UuidType } from "#adapters/schemas/shared/uuid.schema";
import { AuthGuard } from "#common/guards/auth.guard";
/* eslint-disable prettier/prettier */
import { UserService } from "#routes/users/service/users.service";

import { BadRequestException, Controller, Get, NotFoundException, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

/**
 * Public controller for user-related endpoints.
 *
 * Provides endpoints for updating user roles and retrieving user information.
 *
 * @see {@link https://docs.nestjs.com/controllers NestJS Controllers}
 */
@UseGuards(AuthGuard)
@ApiTags("users")
@ApiBearerAuth()
@Controller({
  path: "users",
  version: "1",
})
export class PublicUserController {
  /**
   * Constructs the PublicUserController.
   *
   * @param userService - The service handling user operations.
   */
  constructor(private readonly userService: UserService) {}

  /**
   * Finds a user by their UUID.
   *
   * @param uuid - The UUID of the user to find.
   * @returns An object containing the user data.
   * @throws {HttpException} If validation fails or the user is not found.
   */
  @Get()
  @ApiResponse({ status: 200, description: "User found", type: Object, isArray: false })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @ApiOperation({
    summary: "Find user by UUID",
    description: "Retrieves a user by their UUID.",
  })
  @ApiQuery({ name: "uuid", type: String, required: true, description: "Uuid required query params" })
  async findByUuid(@Query("uuid") uuid: UuidType) {
    console.log(uuid);
    const result = UuidSchema.safeParse(uuid);
    if (!result.success)
      throw new BadRequestException(result.error.message, {
        cause: result.error.message,
        description: "Invalid UUID format",
      });

    const user = await this.userService.findByUuid(uuid);
    if (!user)
      throw new NotFoundException("User not found", {
        cause: new Error("User not found"),
        description: `No user found with UUID: ${uuid}`,
      });

    return {
      success: true,
      data: user,
    };
  }
}
