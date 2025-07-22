import { AuthService } from "#routes/auth/auth.service";
import { Strategy } from "passport-local";

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";

/**
 * LocalStrategy is a Passport strategy for authenticating users using a username and password.
 *
 * This implementation uses the "uuid" field as the username and "password" as the password.
 * It delegates user validation to the AuthService.
 *
 * @see https://docs.nestjs.com/security/authentication#implementing-passport-strategies
 * @see https://github.com/jaredhanson/passport-local
 *
 * @example
 * // Register LocalStrategy in your AuthModule:
 * @Module({
 *   providers: [LocalStrategy, AuthService],
 * })
 * export class AuthModule {}
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  /**
   * Constructs a new LocalStrategy instance.
   *
   * @param authService - The AuthService used to validate user credentials.
   */
  constructor(private authService: AuthService) {
    super({
      /**
       * The field name for the username in the request body.
       * @default "uuid"
       */
      usernameField: "uuid",
      /**
       * The field name for the password in the request body.
       * @default "password"
       */
      passwordField: "password",
    });
  }

  /**
   * Validates the user credentials.
   *
   * @param uuid - The user's UUID (used as username).
   * @param password - The user's password.
   * @returns The user object if validation is successful.
   * @throws UnauthorizedException if validation fails.
   *
   * @example
   * // Example usage in a controller:
   * @UseGuards(AuthGuard('local'))
   * @Post('login')
   * async login(@Request() req) {
   *   return req.user;
   * }
   */
  async validate(uuid: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(uuid, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
