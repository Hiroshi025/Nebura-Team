import { readFileSync } from "fs";
import * as yaml from "js-yaml";
import { join } from "path";

import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import _package from "../package.json";

const YAML_CONFIG_FILENAME = "config/config.yaml"; // Adjust the filename as needed
const config = yaml.load(readFileSync(join(__dirname, "..", YAML_CONFIG_FILENAME), "utf8")) as Record<string, any>;

/**
 * Initializes Swagger (OpenAPI) documentation for the Nebura API.
 *
 * This function configures the Swagger module for NestJS, providing
 * interactive API documentation at `/v1/docs` and downloadable OpenAPI JSON at `/v1/docs/download`.
 *
 * @see https://docs.nestjs.com/openapi/introduction
 * @see https://swagger.io/docs/
 *
 * @example
 * // In your main.ts:
 * import { swagger } from './src/swagger';
 * const app = await NestFactory.create<NestExpressApplication>(AppModule);
 * const createSwaggerDoc = swagger(app);
 * SwaggerModule.setup('/v1/docs', app, createSwaggerDoc());
 *
 * @param app - The NestExpressApplication instance.
 * @returns A factory function that creates the Swagger document.
 */
export const swagger = (app: NestExpressApplication) => {
  interface SwaggerConfig {
    title: string;
    description: string;
    baseUrl?: string;
  }

  interface Config {
    swagger: SwaggerConfig;
    [key: string]: any;
  }

  const documentation: ReturnType<DocumentBuilder['build']> = new DocumentBuilder()
    .setTitle((config as Config).swagger.title)
    .setDescription((config as Config).swagger.description)
    .setVersion(_package.version)
    .addServer("http://localhost:3000/api/v1", "Local development server")
    .addServer((config as Config).swagger.baseUrl || "http://localhost:3000", "Dynamic server URL based on configuration")
    .setContact(
      config.swagger.contact.name || "Nebura Team",
      config.swagger.contact.url || "http://host-hiroshi.dev/support",
      config.swagger.contact.email || "support@nebura.dev"
    )
    .setLicense(
      config.swagger.license.name || "MIT",
      config.swagger.license.url || "https://opensource.org/licenses/MIT"
    )
    .setOpenAPIVersion("3.0.3")
    .setExternalDoc(
      config.swagger.externalDocs.description || "Find more info here",
      config.swagger.externalDocs.url || "http://host-hiroshi.dev/docs"
    )
    .addExtension("x-logo", {
      url: config.swagger.logoUrl || "https://example.com/logo.png",
      altText: config.swagger.logoAltText || "Nebura Logo",
      backgroundColor: config.swagger.logoBackgroundColor || "#FFFFFF",
    })
    .addApiKey(
      {
        name: "Authorization",
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      "access-token"
    )
    .build();

  const factory = () =>
    SwaggerModule.createDocument(app, documentation, {
      operationIdFactory: (controllerKey: string, methodKey: string) => `${controllerKey}_${methodKey}`,
      autoTagControllers: true,
      linkNameFactory: (controllerKey: string, methodKey: string, fieldKey: string) =>
        `${controllerKey}_${methodKey}_${fieldKey}`,
      ignoreGlobalPrefix: false,
      deepScanRoutes: true,
      extraModels: [],
    });

  return factory;
};

/** 
 * Configuration for Swagger UI.
 * This object defines the settings for the Swagger UI, including
 * the URL for the JSON document, options for the Swagger UI,
 */
export const configSwagger = {
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
}; 