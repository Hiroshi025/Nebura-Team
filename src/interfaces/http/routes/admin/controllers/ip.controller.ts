import { Roles } from "#common/decorators/role.decorator";
import { AuthGuard } from "#common/guards/auth.guard";
import { ClientHeaderGuard } from "#common/guards/client-header.guard";
import { RoleGuard } from "#common/guards/permissions/role.guard";
import { UserRole } from "#common/typeRole";
import { CreateIPBlockerDto } from "#routes/admin/dto/create-ip.dto";
import { UpdateIPBlockerDto } from "#routes/admin/dto/update-ip.dto";
import { IPBlockerService } from "#routes/admin/service/ip.service";

import { CacheInterceptor, CacheKey, CacheTTL } from "@nestjs/cache-manager";
import {
	Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, UseGuards,
	UseInterceptors
} from "@nestjs/common";
import {
	ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags
} from "@nestjs/swagger";

/**
 * AdminIPBlockerController
 *
 * Controller for administrative IP blocking management endpoints.
 * Provides endpoints for blocking, viewing, updating, removing, and unblocking IPs.
 *
 * Security:
 * - All endpoints require a valid Bearer token for authentication.
 * - Intended for use by admin-level users.
 */
@UseGuards(AuthGuard, RoleGuard, ClientHeaderGuard)
@ApiBearerAuth()
@ApiTags("admin")
@Controller({
  path: "admin/ip-blocker",
  version: "1",
})
export class AdminIPBlockerController {
  /**
   * Creates an instance of AdminIPBlockerController.
   * @param ipBlockerService Injected IPBlockerService for IP block management logic.
   */
  constructor(private readonly ipBlockerService: IPBlockerService) {}

  /**
   * Retrieves all blocked IPs.
   * @returns An array of all blocked IPs.
   */
  @Get()
  @CacheKey("admin-ip-blocker")
  @CacheTTL(60) // Cache for 60 seconds
  @UseInterceptors(CacheInterceptor)
  @Roles(UserRole.OWNER, UserRole.DEVELOPER)
  @ApiResponse({ status: 200, description: "All blocked IPs retrieved successfully" })
  @ApiOperation({
    summary: "Get all blocked IPs",
    description: "Retrieves all blocked IPs stored in the database.",
  })
  async getAll() {
    return await this.ipBlockerService.findAll();
  }

  /**
   * Retrieves a blocked IP by its ID.
   * @param id The blocked IP record ID.
   * @returns The blocked IP entity.
   * @throws {HttpException} If the IP is not found.
   */
  @Get(":id")
  @CacheKey("admin-ip-blocker-id")
  @CacheTTL(60) // Cache for 60 seconds
  @UseInterceptors(CacheInterceptor)
  @Roles(UserRole.OWNER, UserRole.DEVELOPER)
  @ApiResponse({ status: 200, description: "Blocked IP retrieved successfully" })
  @ApiResponse({ status: 404, description: "Blocked IP not found" })
  @ApiOperation({
    summary: "Get blocked IP by ID",
    description: "Retrieves a blocked IP by its unique ID.",
  })
  @ApiParam({ name: "id", description: "Blocked IP record ID", required: true })
  async getOne(@Param("id") id: number) {
    return await this.ipBlockerService.findOne(id);
  }

  /**
   * Retrieves a blocked IP by its address.
   * @param ipAddress The IP address to retrieve.
   * @returns The blocked IP entity.
   * @throws {HttpException} If the IP is not found.
   */
  @Get("address/:ipAddress")
  @CacheKey("admin-ip-blocker-address")
  @CacheTTL(60) // Cache for 60 seconds
  @UseInterceptors(CacheInterceptor)
  @Roles(UserRole.OWNER, UserRole.DEVELOPER)
  @ApiResponse({ status: 200, description: "Blocked IP retrieved successfully by address" })
  @ApiResponse({ status: 404, description: "Blocked IP not found" })
  @ApiOperation({
    summary: "Get blocked IP by address",
    description: "Retrieves a blocked IP by its address.",
  })
  @ApiParam({ name: "ipAddress", description: "Blocked IP address", required: true })
  async getByIP(@Param("ipAddress") ipAddress: string) {
    return await this.ipBlockerService.findByIP(ipAddress);
  }

  /**
   * Blocks a new IP address.
   * @param body IP block creation payload.
   * @returns The newly blocked IP entity.
   * @throws {HttpException} If validation fails.
   */
  @Post()
  @Roles(UserRole.OWNER, UserRole.DEVELOPER)
  @ApiResponse({ status: 201, description: "IP blocked successfully" })
  @ApiResponse({ status: 400, description: "Validation error" })
  @ApiOperation({
    summary: "Block a new IP address",
    description: "Blocks a new IP address with the provided data.",
  })
  @ApiBody({
    type: CreateIPBlockerDto,
    description: "IP block creation payload",
  })
  async create(@Body() body: CreateIPBlockerDto) {
    if (!body.ipAddress) {
      throw new HttpException("IP address is required", HttpStatus.BAD_REQUEST);
    }
    return await this.ipBlockerService.create(body);
  }

  /**
   * Updates an existing blocked IP by its ID.
   * @param id The blocked IP record ID.
   * @param body IP block update payload.
   * @returns The updated blocked IP entity.
   * @throws {HttpException} If validation fails or IP not found.
   */
  @Put(":id")
  @Roles(UserRole.OWNER, UserRole.DEVELOPER)
  @ApiResponse({ status: 200, description: "Blocked IP updated successfully" })
  @ApiResponse({ status: 400, description: "Validation error" })
  @ApiResponse({ status: 404, description: "Blocked IP not found" })
  @ApiOperation({
    summary: "Update a blocked IP",
    description: "Updates an existing blocked IP by its unique ID.",
  })
  @ApiParam({ name: "id", description: "Blocked IP record ID", required: true })
  @ApiBody({
    type: UpdateIPBlockerDto,
    description: "IP block update payload",
  })
  async update(@Param("id") id: number, @Body() body: UpdateIPBlockerDto) {
    return await this.ipBlockerService.update(id, body);
  }

  /**
   * Removes a blocked IP by its ID.
   * @param id The blocked IP record ID.
   * @returns A message indicating deletion.
   * @throws {HttpException} If IP not found.
   */
  @Delete(":id")
  @Roles(UserRole.OWNER, UserRole.DEVELOPER)
  @ApiResponse({ status: 200, description: "Blocked IP deleted successfully" })
  @ApiResponse({ status: 404, description: "Blocked IP not found" })
  @ApiOperation({
    summary: "Delete a blocked IP",
    description: "Deletes a blocked IP by its unique ID.",
  })
  @ApiParam({ name: "id", description: "Blocked IP record ID", required: true })
  async remove(@Param("id") id: number) {
    await this.ipBlockerService.remove(id);
    return { message: "Blocked IP deleted" };
  }

  /**
   * Unblocks all IPs (sets isActive to false).
   * @returns A message indicating all IPs were unblocked.
   */
  @Put("unblock/all")
  @Roles(UserRole.OWNER, UserRole.DEVELOPER)
  @ApiResponse({ status: 200, description: "All IPs unblocked successfully" })
  @ApiOperation({
    summary: "Unblock all IPs",
    description: "Unblocks all IPs by setting isActive to false.",
  })
  async unblockAll() {
    await this.ipBlockerService.unblockAll();
    return { message: "All IPs unblocked" };
  }

  /**
   * Removes all blocked IP records.
   * @returns A message indicating all blocked IPs were deleted.
   */
  @Delete()
  @Roles(UserRole.OWNER, UserRole.DEVELOPER)
  @ApiResponse({ status: 200, description: "All blocked IPs deleted successfully" })
  @ApiOperation({
    summary: "Delete all blocked IPs",
    description: "Deletes all blocked IPs from the database.",
  })
  async removeAll() {
    await this.ipBlockerService.removeAll();
    return { message: "All blocked IPs deleted" };
  }
}
