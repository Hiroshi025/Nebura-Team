import { AdminGuard } from "#common/guards/secrets/admin.guard";

import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";

import { ErrorHistoryService } from "../error-history.service";

/**
 * Controller responsible for handling error history related endpoints.
 *
 * This controller is protected by the {@link AdminGuard}, ensuring that only authorized
 * admin users can access the error history.
 *
 * @example
 * // Example usage with curl (replace <admin-secret> with your admin key):
 * // curl -H "x-admin: <admin-secret>" http://localhost:3000/error-history
 *
 * @see {@link ErrorHistoryService}
 * @see {@link https://docs.nestjs.com/controllers NestJS Controllers}
 * @see {@link https://docs.nestjs.com/guards NestJS Guards}
 */
@UseGuards(AdminGuard)
@ApiTags("error-history")
@Controller({
  path: "error-history",
  version: "1",
})
export class ErrorHistoryController {
  /**
   * Creates an instance of ErrorHistoryController.
   * @param errorHistoryService The service used to retrieve error history data.
   */
  constructor(private readonly errorHistoryService: ErrorHistoryService) {}

  /**
   * Retrieves the error history.
   *
   * This endpoint returns a list of error history records.
   * Access is restricted to users passing the correct `x-admin` header.
   *
   * @returns A promise resolving to the error history data.
   *
   * @example
   * // Example response:
   * // [
   * //   { "id": 1, "message": "Error message", "timestamp": "2024-06-01T12:00:00Z" },
   * //   ...
   * // ]
   */
  @Get()
  @ApiResponse({ status: 200, description: "Retrieve the error history." })
  async getErrorHistory() {
    return this.errorHistoryService.getErrorHistory();
  }
}
