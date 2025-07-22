/* eslint-disable prettier/prettier */
import { UserService } from "#routes/users/users.service";
import z from "zod";

import {
	BadRequestException, Controller, Get, NotFoundException, Query, UseGuards
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";

/**
 * Public controller for user-related endpoints.
 *
 * Provides endpoints for updating user roles and retrieving user information.
 *
 * @see {@link https://docs.nestjs.com/controllers NestJS Controllers}
 */
@UseGuards(AuthGuard("jwt"))
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
  @ApiResponse({ status: 400, description: "Invalid UUID format" })
  @ApiResponse({ status: 404, description: "User not found" })
  async findByUuid(@Query("uuid") uuid: string) {
    const validZod = z.object({
      uuid: z.uuid(),
    });

    const result = validZod.safeParse({ uuid });
    if (!result.success)
      throw new BadRequestException(result.error.message, {
        cause: result.error,
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
