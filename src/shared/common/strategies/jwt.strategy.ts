import { JwtError } from "#common/errorClient";
import { ExtractJwt, Strategy } from "passport-jwt";

/* eslint-disable @typescript-eslint/require-await */
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";

/**
 * JwtStrategy is a Passport strategy for authenticating users using a JSON Web Token (JWT).
 *
 * This strategy extracts the JWT from the Authorization header as a Bearer token,
 * validates it using the secret from the configuration, and attaches the user payload to the request.
 *
 * @see https://docs.nestjs.com/security/authentication#jwt-functionality
 * @see https://github.com/mikenicholson/passport-jwt
 *
 * @example
 * // Register JwtStrategy in your AuthModule:
 * @Module({
 *   imports: [PassportModule],
 *   providers: [JwtStrategy],
 * })
 * export class AuthModule {}
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Logger instance for debugging and logging JWT validation events.
   */
  private readonly logger = new Logger(JwtStrategy.name);

  /**
   * Constructs a new JwtStrategy instance.
   *
   * @param configService - The ConfigService used to retrieve the JWT secret.
   * @throws Error if JWT_SECRET is not defined in the configuration.
   */
  constructor(configService: ConfigService) {
    const jwtSecret = configService.get<string>("JWT_SECRET");
    if (!jwtSecret) {
      throw new JwtError("JWT_SECRET is not defined in the configuration");
    }

    super({
      /**
       * Extracts the JWT from the Authorization header as a Bearer token.
       * @see https://github.com/mikenicholson/passport-jwt#extracting-the-jwt-from-the-request
       */
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      /**
       * If true, the expiration of the token will be ignored.
       * For security, this is set to false.
       */
      ignoreExpiration: false,
      /**
       * Secret key used to verify the JWT signature.
       */
      secretOrKey: jwtSecret,
    });
  }

  /**
   * Validates the JWT payload and returns the user object to be attached to the request.
   *
   * @param payload - The decoded JWT payload.
   * @returns An object containing userId, username, and role.
   *
   * @example
   * // Example payload:
   * // {
   * //   sub: "123456",
   * //   username: "john_doe",
   * //   role: "admin"
   * // }
   * // Returned object:
   * // {
   * //   userId: "123456",
   * //   username: "john_doe",
   * //   role: "admin"
   * // }
   */
  async validate(payload: any) {
    this.logger.debug("JWT payload received:", payload);
    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}
