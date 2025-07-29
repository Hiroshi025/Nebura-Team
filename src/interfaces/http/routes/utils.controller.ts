import { UserEntity } from "#entity/users/user.entity";
import { Repository } from "typeorm";

import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";

import { HealthService } from "./health/health.service";

/**
 * Dashboard utilities controller.
 *
 * This controller provides auxiliary endpoints for the dashboard frontend,
 * such as real-time system status in JSON format.
 *
 * @see {@link https://docs.nestjs.com/controllers NestJS Controllers Documentation}
 * @see {@link HealthService}
 *
 * @example
 * // Example usage in a browser:
 * // GET http://localhost:3000/dashboard/utils/status-json
 * // Response:
 * // {
 * //   "memory": { ... },
 * //   "cpu": { ... },
 * //   "uptime": 123456,
 * //   "now": "2024-06-09T12:34:56.789Z"
 * // }
 */
@ApiExcludeController(true)
@Controller({
  path: "dashboard/utils",
})
export class UtilsController {
  /**
   * Injects the HealthService to retrieve system health data.
   * @param healthService The service used to get health information.
   */
  constructor(
    private readonly healthService: HealthService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Returns the current system status in JSON format.
   *
   * This endpoint is designed for real-time dashboard updates via AJAX/fetch.
   * It provides memory usage, CPU usage, uptime, and the current timestamp.
   *
   * @route GET /dashboard/utils/status-json
   * @returns {Promise<object>} An object containing memory, CPU, uptime, and timestamp.
   *
   * @example
   * // Fetch system status from the frontend:
   * fetch('/dashboard/utils/status-json')
   *   .then(res => res.json())
   *   .then(data => {
   *     console.log(data.memory); // Memory info
   *     console.log(data.cpu);    // CPU info
   *     console.log(data.uptime); // Uptime in seconds
   *     console.log(data.now);    // ISO timestamp
   *   });
   *
   * @see {@link HealthService.checkHealth}
   */
  @Get("status-json")
  async statusJson(): Promise<{
    memory: any;
    cpu: any;
    uptime: number;
    now: string;
  }> {
    const health = await this.healthService.checkHealth();
    // You can add more fields if needed for the dashboard
    return {
      memory: health.info.memory,
      cpu: health.info.cpu,
      uptime: health.info.uptime,
      now: new Date().toISOString(),
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
  async convertToClient(@Body("uuid") uuid: string) {
    const user = await this.userRepository.findOne({ where: { uuid } });
    if (!user) {
      return { success: false, message: "User not found", data: null };
    }
    if (user.isClient) {
      return { success: true, message: "User is already a client", data: user };
    }
    user.isClient = true;
    await this.userRepository.save(user);
    return { success: true, message: "User converted to client successfully", data: user };
  }
}
