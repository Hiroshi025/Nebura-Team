/* eslint-disable prettier/prettier */
/**
 * Controller for client-related endpoints.
 *
 * Handles HTTP requests for retrieving user licenses and specific license details.
 * Uses guards for authentication and role-based access control.
 *
 * @example
 * // Example usage in NestJS module
 * @Module({
 *   controllers: [ClientController],
 *   providers: [ClientService],
 * })
 * export class ClientModule {}
 *
 * @see {@link https://docs.nestjs.com/controllers NestJS Controllers}
 * @see {@link https://docs.nestjs.com/guards NestJS Guards}
 */
import { Roles } from "#common/decorators/role.decorator";
import { AuthGuard } from "#common/guards/auth.guard";
import { RoleGuard } from "#common/guards/permissions/role.guard";
import { UserRole } from "#common/typeRole";
import { LicenseEntity } from "#entity/utils/licence.entity";

import { Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

import { ClientService } from "../client.service";

/**
 * Controller for client endpoints.
 *
 * All routes are protected by authentication and role guards.
 * Only users with the CLIENT role can access these endpoints.
 */
@UseGuards(AuthGuard, RoleGuard)
@Roles(UserRole.CLIENT)
@ApiTags("client")
@ApiBearerAuth()
@Controller({
  path: "client",
  version: "1",
})
export class ClientController {
  /**
   * Creates an instance of ClientController.
   *
   * @param clientService - The service handling client-related business logic.
   */
  constructor(private readonly clientService: ClientService) {}

  /**
   * Retrieves all licenses associated with the authenticated user.
   *
   * @param uuid - UUID of the user (from query).
   * @returns Array of LicenseEntity objects.
   */
  @Get("licenses")
  @ApiOperation({
    summary: "Get all licenses for user",
    description: "Retrieves all licenses associated with the authenticated user.",
  })
  @ApiResponse({ status: 200, description: "Licenses retrieved successfully", type: [LicenseEntity] })
  @ApiResponse({ status: 404, description: "No licenses found for user" })
  @ApiQuery({ name: "uuid", type: String, required: true, description: "UUID of the user" })
  async getLicenses(@Query("uuid") uuid: string) {
    return this.clientService.getLicenses(uuid);
  }

  /**
   * Retrieves a specific license by its unique identifier.
   *
   * @param identifier - Unique license identifier.
   * @returns LicenseEntity object.
   */
  @Get("license/:identifier")
  @ApiOperation({ summary: "Get license by identifier", description: "Retrieves a specific license by its unique identifier." })
  @ApiResponse({ status: 200, description: "License retrieved successfully", type: LicenseEntity })
  @ApiResponse({ status: 404, description: "License not found" })
  @ApiParam({ name: "identifier", type: String, required: true, description: "Unique license identifier" })
  async getLicense(@Param("identifier") identifier: string) {
    return this.clientService.getLicenseByIdentifier(identifier);
  }

  /**
   * Resets the registered IPs for a specific license.
   *
   * @param identifier - Unique license identifier.
   * @returns Object indicating success and updated license.
   */
  @Post("license/:identifier/reset-ips")
  @ApiOperation({ summary: "Reset license IPs", description: "Resets the registered IPs for a specific license." })
  @ApiResponse({ status: 200, description: "License IPs reset successfully", type: LicenseEntity })
  @ApiResponse({ status: 404, description: "License not found" })
  @ApiParam({ name: "identifier", type: String, required: true, description: "Unique license identifier" })
  async resetLicenseIps(@Param("identifier") identifier: string) {
    return this.clientService.resetLicenseIps(identifier);
  }
}
