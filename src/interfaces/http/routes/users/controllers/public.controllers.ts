import { UuidSchema, UuidType } from "#adapters/schemas/shared/uuid.schema";
import { AuthGuard } from "#common/guards/auth.guard";
import { UserService } from "#routes/users/service/users.service";

import {
	BadRequestException, Controller, Get, Ip, NotFoundException, Query, UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

/**
 * Public controller for user-related endpoints.
 *
 * Provides endpoints for updating user roles and retrieving user information.
 *
 * @see {@link https://docs.nestjs.com/controllers NestJS Controllers}
 */
@ApiTags("users")
@ApiBearerAuth()
@Controller({
  version: "1",
})
export class PublicUserController {
  /**
   * Constructs the PublicUserController.
   *
   * @param userService - The service handling user operations.
   */
  constructor(
    private readonly userService: UserService,
  ) {}

  /**
   * Finds a user by their UUID.
   *
   * @param uuid - The UUID of the user to find.
   * @returns An object containing the user data.
   * @throws {HttpException} If validation fails or the user is not found.
   */
  @Get("users/me")
  @ApiResponse({ status: 200, description: "User found", type: Object, isArray: false })
  @ApiResponse({ status: 500, description: "Internal server error" })
  @UseGuards(AuthGuard)
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

  /**
   * Validates a software licence.
   *
   * This endpoint checks if the licence is valid by verifying:
   * - The licence key and identifier match an existing licence.
   * - The licence has not expired.
   * - The request count does not exceed the request limit.
   * - The number of registered IPs does not exceed the maximum allowed.
   * - If the provided IP is not registered and there is space, it will be added.
   *
   * @param key - Licence key to validate.
   * @param identifier - Unique licence identifier.
   * @param ip - IP address making the request.
   * @returns Validation result and licence data if valid.
   *
   * @throws {BadRequestException} If any validation fails.
   * @throws {NotFoundException} If the licence is not found.
   *
   * @see {@link https://docs.nestjs.com/controllers NestJS Controllers}
   * @see {@link https://docs.nestjs.com/openapi/introduction NestJS Swagger}
   */
  @Get("validate-licence")
  @ApiOperation({
    summary: "Validate a software licence",
    description: "Checks licence validity, expiration, request limits, IP registration, and identifier.",
  })
  @ApiQuery({ name: "key", type: String, required: true, description: "Licence key" })
  @ApiQuery({ name: "identifier", type: String, required: true, description: "Unique licence identifier" })
  @ApiResponse({ status: 200, description: "Licence is valid", type: Object })
  @ApiResponse({ status: 400, description: "Licence validation failed" })
  @ApiResponse({ status: 404, description: "Licence not found" })
  async validateLicence(
    @Query("key") key: string,
    @Query("identifier") identifier: string,
    @Ip() ip: string
  ) {
    const licenceData = await this.userService.validateLicence(key, identifier, ip);
    return {
      success: true,
      data: licenceData,
    };
  }
}
