/* eslint-disable @typescript-eslint/require-await */
import { Controller, Get, Render } from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";

import { HealthService } from "./health/health.service";

/**
 * The main application controller.
 *
 * This controller handles the root route of the application and renders the index page,
 * passing health and error data to the view.
 *
 * @see {@link https://docs.nestjs.com/controllers NestJS Controllers Documentation}
 * @example
 * // Example usage in a browser:
 * // Visiting http://localhost:3000/ will render the index page with health and error data.
 */
@ApiExcludeController(true)
@Controller({
  path: "dashboard",
})
export class AppController {
  /**
   * Injects the HealthService to retrieve health and error data.
   * @param healthService The service used to get health and error information.
   */
  constructor(private readonly healthService: HealthService) {}

  /**
   * Handles GET requests to the root path ('/').
   *
   * Renders the 'index' view and passes a message, health data, and error history to the template.
   *
   * @returns An object containing a greeting message, health status, and error history.
   * @example
   * // Example response:
   * // { message: "Hello world!", health: {...}, errors: [...] }
   */
  @Get("status")
  @Render("status")
  async root() {
    const health = await this.healthService.checkHealth();
    const errors = await this.healthService.getErrorHistory();
    return {
      title: "Nebura Status",
      message: "Health check successful!",
      health,
      errors,
    };
  }

  @Get("playground")
  @Render("playground")
  async onPlayground() {
    return {
      title: "Nebura Playground",
      message: "Welcome to the Nebura Playground!",
    };
  }
}
