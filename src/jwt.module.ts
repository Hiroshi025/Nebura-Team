/* eslint-disable @typescript-eslint/require-await */

/**
 * @module JwtConfigModule
 *
 * This module provides JWT (JSON Web Token) configuration for the application using NestJS.
 * It registers the JwtModule asynchronously, allowing dynamic configuration via environment variables.
 *
 * @remarks
 * - The JWT secret and expiration time are loaded from the application's configuration.
 * - This module exports the configured JwtModule for use in other modules.
 *
 * @see [NestJS JWT Documentation](https://docs.nestjs.com/security/authentication#jwt-functionality)
 * @see [jsonwebtoken npm package](https://www.npmjs.com/package/jsonwebtoken)
 *
 * @example
 * // Import JwtConfigModule in your feature module
 * import { JwtConfigModule } from './jwt.module';
 *
 * @module
 */

import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

/**
 * JwtConfigModule is responsible for configuring and providing the JwtModule
 * with dynamic settings such as secret and expiration time.
 *
 * @class
 * @exports JwtConfigModule
 */
@Module({
  imports: [
    /**
     * Registers the JwtModule asynchronously, injecting configuration values.
     *
     * @param {ConfigService} config - The configuration service used to retrieve JWT settings.
     * @returns {JwtModuleOptions} The options for JWT configuration.
     */
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        /**
         * The secret key used to sign JWT tokens.
         * Loaded from the environment variable `JWT_SECRET`.
         */
        secret: config.get<string>("JWT_SECRET"),
        signOptions: {
          /**
           * The expiration time for JWT tokens.
           * Loaded from the environment variable `JWT_EXPIRES_IN`, defaults to '1d'.
           * @default "1d"
           */
          expiresIn: config.get<string>("JWT_EXPIRES_IN", "1d"),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [JwtModule],
})
export class JwtConfigModule {}
