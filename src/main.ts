import { registerWatchedPartials } from "#shared/hbs-watched";
import { LoggerService } from "#shared/utils/custom-logger";
import { registerHelpers } from "#shared/utils/helpers";
import session from "express-session";
import hbs from "hbs";
import helmet from "helmet";
import passport from "passport";
import { join } from "path";
import { loadEnvFile } from "process";
import responseTime from "response-time";

import { Logger, ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";

/**
 * Main class responsible for initializing and starting the Nebura API application.
 *
 * This class orchestrates the setup of the NestJS application, including:
 * - Enabling API versioning via URI prefix.
 * - Initializing the database connection.
 * - Configuring Swagger documentation for API endpoints.
 * - Applying security middleware (Helmet).
 * - Setting up global validation pipes.
 * - Managing application logging.
 *
 * @see {@link https://docs.nestjs.com/ NestJS Documentation}
 * @see {@link https://docs.nestjs.com/openapi/introduction NestJS Swagger}
 * @see {@link https://docs.nestjs.com/techniques/database NestJS TypeORM}
 * @see {@link https://docs.nestjs.com/techniques/logger Logger}
 * @see {@link https://helmetjs.github.io/ Helmet}
 */
loadEnvFile();
export class Main {
  /**
   * Logger instance for application-wide logging.
   * Used to log messages and errors throughout the application lifecycle.
   * @type {Logger}
   */
  public readonly logger: Logger = new Logger(Main.name);

  /**
   * Constructs the Main class and sets the logger context to "Main".
   *
   * This ensures that all logs from this class are properly tagged.
   */
  constructor() {}

  /**
   * Initializes and configures the main NestJS application module.
   *
   * This method performs the following main steps:
   * 1. Creates the NestJS application with a custom logger.
   * 2. Applies global validation pipes for request validation.
   * 3. Enables URI-based API versioning with the prefix 'v'.
   * 4. Configures the folder for static files and the view engine.
   * 5. Sets up Swagger documentation for the API.
   * 6. Applies Helmet middleware for enhanced HTTP security.
   * 7. Starts the application on the specified port.
   *
   * Example usage:
   * ```typescript
   * const main = new Main();
   * await main.init();
   * // Access API: http://localhost:3000/v1/your-endpoint
   * // Access Swagger UI: http://localhost:3000/v1/docs
   * // Download Swagger JSON: http://localhost:3000/v1/docs/download
   * ```
   *
   * @private
   * @returns {Promise<void>} Resolves when the application is successfully started.
   *
   * @see {@link https://docs.nestjs.com/techniques/validation ValidationPipe}
   * @see {@link https://docs.nestjs.com/techniques/versioning API Versioning}
   * @see {@link https://docs.nestjs.com/openapi/introduction SwaggerModule}
   * @see {@link https://helmetjs.github.io/ Helmet}
   */
  private async moduleApp(): Promise<void> {
    // 1. Create the NestJS application with a custom logger
    //    - Uses ConsoleLogger for colored output in development.
    //    - See: https://docs.nestjs.com/fundamentals/logging
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger:
        process.env.NODE_ENV === "development"
          ? new LoggerService({
              colors: true,
              sorted: true,
              prefix: "Nebura",
              maxArrayLength: 1000,
              maxStringLength: 1000,
              timestamp: true,
              logLevels: ["error", "warn", "log", "debug", "verbose"],
            })
          : false,
    });

    // 2. Apply global validation pipes
    //    - Ensures all incoming requests are validated.
    //    - See: https://docs.nestjs.com/techniques/validation
    app.useGlobalPipes(
      new ValidationPipe({
        enableDebugMessages: true,
        whitelist: true, // Strip properties that do not have decorators
        forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
        transform: true, // Automatically transform payloads to DTO instances
      }),
    );

    // 3. Enable API versioning by URI
    //    - Allows endpoints like /v1/your-endpoint
    //    - See: https://docs.nestjs.com/techniques/versioning
    app.enableVersioning({
      type: VersioningType.URI,
      prefix: "api/v",
    });

    // 4. Configure static files and view engine
    //    - Serves static assets from /interfaces/http/views/public
    //    - Sets Handlebars (hbs) as the view engine
    //    - See: https://docs.nestjs.com/techniques/mvc
    app.useStaticAssets(join(__dirname, "..", "web", "public"));
    app.setBaseViewsDir(join(__dirname, "..", "web", "views"));
    app.useStaticAssets(join(process.cwd(), "documentation"), {
      prefix: "/docs",
    });

    app.setViewEngine("hbs");
    app.set("view options", { layout: "/layouts/main" });

    registerHelpers(hbs);
    hbs.registerHelper("inc", function (value) {
      return parseInt(value) + 1;
    });
    hbs.registerPartials(join(__dirname, "..", "web", "views", "partials"));
    if (process.env.NODE_ENV === "development") {
      registerWatchedPartials(join(__dirname, "..", "web", "views", "partials"));
    }

    hbs.localsAsTemplateData(app);
    hbs.registerHelper("json", function (context) {
      return JSON.stringify(context, null, 2);
    });

    // 5. Configure Swagger for API documentation
    //    - Interactive API docs at /v1/docs
    //    - Downloadable OpenAPI JSON at /v1/docs/download
    //    - JWT Bearer authentication enabled
    //    - See: https://docs.nestjs.com/openapi/introduction
    const swaggerApp = new DocumentBuilder()
      .setTitle("Nebura API")
      .setDescription("API documentation for the Nebura application")
      .setVersion("1.0")
      .addSecurity("bearer", {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter JWT token in the format: Bearer <token>",
      })
      .addServer("http://localhost:3000", "Local development server")
      .addGlobalResponse({
        status: 500,
        description: "Internal Server Error",
      })
      .build();

    const documentFactory = () =>
      SwaggerModule.createDocument(app, swaggerApp, {
        operationIdFactory: (controllerKey: string, methodKey: string) => `${controllerKey}_${methodKey}`,
        autoTagControllers: true,
        linkNameFactory: (controllerKey: string, methodKey: string, fieldKey: string) =>
          `${controllerKey}_${methodKey}_${fieldKey}`,
        ignoreGlobalPrefix: false,
        deepScanRoutes: true,
        extraModels: [],
      });
    SwaggerModule.setup("v1/docs", app, documentFactory, {
      jsonDocumentUrl: "v1/docs/download",
      swaggerOptions: {
        displayRequestDuration: true,
        persistAuthorization: true,
        docExpansion: "list",
      },
      customSiteTitle: process.env.SWAGGER_TITLE,
      customfavIcon: process.env.SWAGGER_FAVICON_URL,
      customCssUrl: "/css/swagger.css",
      explorer: true,
      swaggerUiEnabled: true,
    });

    // 6. Apply Helmet middleware for HTTP security
    //    - Sets various HTTP headers for security best practices
    //    - CSP and COEP are disabled for development simplicity
    //    - See: https://helmetjs.github.io/
    app.use(
      helmet({
        contentSecurityPolicy: false, // CSP disabled for simplicity
        crossOriginEmbedderPolicy: false, // COEP disabled for simplicity
      }),
    );

    // 7. Configure session management with express-session
    //    - Uses a secret from environment variables or a default value
    //    - Sets session cookie max age to 1 hour
    //    - See: https://www.npmjs.com/package/express-session
    app.use(
      session({
        secret: (process.env.SESSION_SECRET as string) || "default_session_secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
          maxAge: 86400000, // 1 día
          secure: process.env.NODE_ENV === "production", // HTTPS en producción
        },
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-call
        store: new (require("connect-sqlite3")(session))({
          db: `sessions.sqlite`,
          dir: "./src/adapters/database",
        }),
      }),
    );

    app.use(passport.initialize());
    app.use(responseTime());
    app.use(passport.session());

    // 8. Start the application on the specified port
    //    - Default: 3000, or use process.env.PORT
    //    - Logs the URL for API and Swagger UI
    //app.useGlobalGuards(new RolesGuard());
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    await app.listen(port, "0.0.0.0");
    this.logger.debug(`Nebura API is running at http://localhost:${port}/v1/`);
    this.logger.debug(`Swagger UI available at http://localhost:${port}/v1/docs`);
  }

  /**
   * Initializes the database connection and starts the API application.
   *
   * This method is the main entry point for starting the Nebura API.
   * It calls the internal moduleApp method to configure and launch the application,
   * and logs a success message upon successful startup.
   *
   * @returns {Promise<void>} Resolves when the application is running.
   *
   * @example
   * const main = new Main();
   * await main.init();
   */
  public async init(): Promise<void> {
    await this.moduleApp();
    this.logger.debug("Application API successfully on port " + (process.env.PORT ?? 3000));
  }
}

/**
 * Entry point for the Nebura API application.
 *
 * This code creates an instance of the Main class and starts the initialization process.
 * If the application fails to start, it logs the error using the custom logger and outputs it to the console.
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
