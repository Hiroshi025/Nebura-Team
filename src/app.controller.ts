import { Controller, Get, Render } from "@nestjs/common";

/**
 * The main application controller.
 *
 * This controller handles the root route of the application and renders the index page.
 *
 * @see {@link https://docs.nestjs.com/controllers NestJS Controllers Documentation}
 * @example
 * // Example usage in a browser:
 * // Visiting http://localhost:3000/ will render the index page with a message.
 */
@Controller()
export class AppController {
  /**
   * Handles GET requests to the root path ('/').
   *
   * Renders the 'index' view and passes a message to the template.
   *
   * @returns An object containing a greeting message to be rendered in the view.
   * @example
   * // Example response:
   * // { message: "Hello world!" }
   */
  @Get()
  @Render("index")
  root() {
    return { message: "Hello world!" };
  }
}
