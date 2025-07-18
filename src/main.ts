import helmet from "helmet";

import { ConsoleLogger, ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";
import { Logger } from "./shared/logger";

/**
 * Main class responsible for initializing and starting the Nebura API application.
 *
 * Handles the setup of the NestJS application, enables API versioning,
 * initializes the database connection, configures Swagger documentation,
 * applies security middleware, and manages application logging.
 *
 * @see {@link https://docs.nestjs.com/ NestJS Documentation}
 * @see {@link https://docs.nestjs.com/openapi/introduction NestJS Swagger}
 * @see {@link https://docs.nestjs.com/techniques/database NestJS TypeORM}
 * @see {@link https://docs.nestjs.com/techniques/logger Logger}
 * @see {@link https://helmetjs.github.io/ Helmet}
 */
export class Main {
  /**
   * Logger instance for application-wide logging.
   * Used to log messages and errors throughout the application lifecycle.
   * @type {Logger}
   */
  public logger = new Logger();

  /**
   * Constructs the Main class and sets the logger context to "Main".
   */
  constructor() {
    this.logger.setContext("Main");
  }

  /**
   * Initializes and configures the NestJS application module.
   * Enables URI-based API versioning with the prefix 'v'.
   * Sets up Swagger documentation for the API.
   * Applies global validation pipes and security middleware.
   * Starts the application on the specified port.
   *
   * @private
   * @returns {Promise<void>}
   *
   * @see {@link https://docs.nestjs.com/techniques/validation ValidationPipe}
   * @see {@link https://docs.nestjs.com/techniques/versioning API Versioning}
   * @see {@link https://docs.nestjs.com/openapi/introduction SwaggerModule}
   * @see {@link https://helmetjs.github.io/ Helmet}
   */
  private async moduleApp(): Promise<void> {
    const app = await NestFactory.create(AppModule, {
      logger: new ConsoleLogger({
        colors: true,
      }),
    });
    app.useGlobalPipes(
      new ValidationPipe({
        enableDebugMessages: true,
      }),
    );
    app.enableVersioning({
      type: VersioningType.URI,
      prefix: "v",
    });

    const swaggerApp = new DocumentBuilder()
      .setTitle("Nebura API")
      .setDescription("API documentation for the Nebura application")
      .addSecurity("bearer", {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      })
      .setVersion("1.0")
      .build();

    const documentFactory = () => SwaggerModule.createDocument(app, swaggerApp);
    SwaggerModule.setup("v1/documentation", app, documentFactory, {
      jsonDocumentUrl: "v1/documentation-json",
      swaggerOptions: {
        displayRequestDuration: true,
        persistAuthorization: true,
      },
    });

    app.use(
      helmet({
        contentSecurityPolicy: false, // Disable CSP for simplicity, adjust as needed
        crossOriginEmbedderPolicy: false, // Disable COEP for simplicity, adjust as needed
      }),
    );
    await app.listen(process.env.PORT ?? 3000);
  }

  /**
   * Initializes the database connection and starts the API application.
   * Logs a success message when the application is running.
   *
   * @returns {Promise<void>}
   *
   * @example
   * const main = new Main();
   * await main.init();
   */
  public async init(): Promise<void> {
    await this.moduleApp();
    this.logger.log("Application API successfully on port " + (process.env.PORT ?? 3000));
  }
}

/**
 * Entry point for the Nebura API application.
 * Creates an instance of Main and starts the initialization process.
 * Logs errors if the application fails to start.
 *
 * @see {@link https://docs.nestjs.com/ NestJS Documentation}
 * @example
 * // Run the application
 * node dist/main.js
 */
export const main = new Main();
main.init().catch((error) => {
  main.logger.error("Application failed to start", error);
  console.log(error);
});
