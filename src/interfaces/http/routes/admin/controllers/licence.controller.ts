import { LicenceCreateSchema, LicenceUpdateSchema } from "#adapters/schemas/licence.schema";
import { Roles } from "#common/decorators/role.decorator";
import { AuthGuard } from "#common/guards/auth.guard";
import { ClientHeaderGuard } from "#common/guards/client-header.guard";
import { RoleGuard } from "#common/guards/permissions/role.guard";
import { UserRole } from "#common/typeRole";
import { LicenceCreateDto } from "#routes/admin/dto/create-licence.dto";
import { LicenceUpdateDto } from "#routes/admin/dto/update-licence.dto";
import { LicenceService } from "#routes/admin/service/licence.service";

import {
	BadRequestException, Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put,
	UseGuards
} from "@nestjs/common";
import {
	ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags
} from "@nestjs/swagger";

/**
 * AdminLicenceController
 *
 * Controller for administrative licence management endpoints.
 * Provides endpoints for viewing, creating, editing, deleting, listing all licences,
 * and deleting all licences.
 *
 * Security:
 * - All endpoints require a valid Bearer token for authentication.
 * - Intended for use by admin-level users.
 *
 * @see https://docs.nestjs.com/controllers
 * @see https://docs.nestjs.com/openapi/introduction
 *
 * @example
 * // Get all licences
 * GET /admin/licence
 *
 * // Create a new licence
 * POST /admin/licence
 * {
 *   "key": "ABC123-XYZ789",
 *   "type": "premium",
 *   "userId": "user-uuid-123",
 *   "adminId": "admin-uuid-456",
 *   "validUntil": "2025-12-31T23:59:59Z"
 * }
 */
@UseGuards(AuthGuard, RoleGuard, ClientHeaderGuard)
@ApiBearerAuth()
@ApiTags("admin")
@Controller({
  path: "admin/licence",
  version: "1",
})
export class AdminLicenceController {
  /**
   * Creates an instance of AdminLicenceController.
   * @param licenceService Injected LicenceService for licence management logic.
   */
  constructor(private readonly licenceService: LicenceService) {}

  /**
   * Retrieves all licences.
   * @returns An array of all licences.
   * @see https://docs.nestjs.com/controllers#routing-requests
   *
   * @example
   * GET /admin/licence
   */
  @Get()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.DEVELOPER)
  @ApiResponse({ status: 200, description: "All licences retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiOperation({
    summary: "Get all licences",
    description: "Retrieves all licences stored in the database.",
  })
  async getAll() {
    return await this.licenceService.findAll();
  }

  /**
   * Retrieves a single licence by its ID.
   * @param id The licence ID to retrieve.
   * @returns The licence entity.
   * @throws {HttpException} If the licence is not found.
   *
   * @example
   * GET /admin/licence/550e8400-e29b-41d4-a716-446655440000
   */
  @Get(":id")
  @Roles(UserRole.ADMIN)
  @ApiResponse({ status: 200, description: "Licence retrieved successfully" })
  @ApiResponse({ status: 404, description: "Licence not found" })
  @ApiOperation({
    summary: "Get licence by ID",
    description: "Retrieves a single licence by its unique ID.",
  })
  @ApiParam({ name: "id", description: "Licence UUID", required: true })
  async getOne(@Param("id") id: string) {
    return await this.licenceService.findOne(id);
  }

  /**
   * Retrieves a single licence by its unique identifier.
   * @param identifier The unique identifier to retrieve.
   * @returns The licence entity.
   * @throws {HttpException} If the licence is not found.
   *
   * @example
   * GET /admin/licence/identifier/LIC-UNIQUE-001
   */
  @Get("identifier/:identifier")
  @Roles(UserRole.ADMIN)
  @ApiResponse({ status: 200, description: "Licence retrieved successfully by identifier" })
  @ApiResponse({ status: 404, description: "Licence not found" })
  @ApiOperation({
    summary: "Get licence by identifier",
    description: "Retrieves a single licence by its unique identifier.",
  })
  @ApiParam({ name: "identifier", description: "Unique licence identifier", required: true })
  async getByIdentifier(@Param("identifier") identifier: string) {
    return await this.licenceService.findByIdentifier(identifier);
  }

  /**
   * Creates a new licence.
   * @param body Licence creation payload.
   * @returns The newly created licence entity.
   * @throws {HttpException} If validation fails.
   *
   * @example
   * POST /admin/licence
   * {
   *   "key": "ABC123-XYZ789",
   *   "type": "premium",
   *   "userId": "user-uuid-123",
   *   "adminId": "admin-uuid-456",
   *   "validUntil": "2025-12-31T23:59:59Z"
   * }
   */
  @Post()
  @ApiResponse({ status: 201, description: "Licence created successfully" })
  @ApiResponse({ status: 400, description: "Validation error" })
  @ApiOperation({
    summary: "Create a new licence",
    description: "Creates a new licence with the provided data.",
  })
  @Roles(UserRole.OWNER, UserRole.DEVELOPER)
  @ApiBody({
    type: LicenceCreateDto,
    description: "Licence creation payload",
  })
  async create(@Body() body: LicenceCreateDto) {
    const parse = LicenceCreateSchema.safeParse(body);
    if (!parse.success) {
      throw new BadRequestException(parse.error.message, {
        cause: new Error("Validation failed"),
        description: "Invalid licence creation data",
      });
    }
    return await this.licenceService.create(parse.data);
  }

  /**
   * Updates an existing licence by its ID.
   * @param id The licence ID to update.
   * @param body Licence update payload.
   * @returns The updated licence entity.
   * @throws {HttpException} If validation fails or licence not found.
   *
   * @example
   * PUT /admin/licence/550e8400-e29b-41d4-a716-446655440000
   * {
   *   "type": "enterprise",
   *   "requestLimit": 5000
   * }
   */
  @Put(":id")
  @ApiResponse({ status: 200, description: "Licence updated successfully" })
  @ApiResponse({ status: 400, description: "Validation error" })
  @ApiResponse({ status: 404, description: "Licence not found" })
  @ApiOperation({
    summary: "Update a licence",
    description: "Updates an existing licence by its unique ID.",
  })
  @Roles(UserRole.OWNER, UserRole.DEVELOPER)
  @ApiParam({ name: "id", description: "Licence UUID", required: true })
  @ApiBody({
    type: LicenceUpdateDto,
    description: "Licence update payload",
  })
  async update(@Param("id") id: string, @Body() body: LicenceUpdateDto) {
    const parse = LicenceUpdateSchema.safeParse(body);
    if (!parse.success) {
      throw new HttpException(parse.error.message, HttpStatus.BAD_REQUEST);
    }
    return await this.licenceService.update(id, parse.data);
  }

  /**
   * Deletes a licence by its ID.
   * @param id The licence ID to delete.
   * @returns A message indicating deletion.
   * @throws {HttpException} If licence not found.
   *
   * @example
   * DELETE /admin/licence/550e8400-e29b-41d4-a716-446655440000
   */
  @Delete(":id")
  @ApiResponse({ status: 200, description: "Licence deleted successfully" })
  @ApiResponse({ status: 404, description: "Licence not found" })
  @ApiOperation({
    summary: "Delete a licence",
    description: "Deletes a licence by its unique ID.",
  })
  @Roles(UserRole.OWNER, UserRole.DEVELOPER)
  @ApiParam({ name: "id", description: "Licence UUID", required: true })
  async remove(@Param("id") id: string) {
    await this.licenceService.remove(id);
    return { message: "Licence deleted" };
  }

  /**
   * Deletes all licences.
   * @returns A message indicating all licences were deleted.
   *
   * @example
   * DELETE /admin/licence
   */
  @Delete()
  @ApiResponse({ status: 200, description: "All licences deleted successfully" })
  @ApiOperation({
    summary: "Delete all licences",
    description: "Deletes all licences from the database.",
  })
  @Roles(UserRole.OWNER, UserRole.DEVELOPER)
  async removeAll() {
    await this.licenceService.removeAll();
    return { message: "All licences deleted" };
  }
}
