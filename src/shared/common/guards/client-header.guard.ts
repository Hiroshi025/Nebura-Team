import { UserEntity } from "#entity/users/user.entity";
import { Repository } from "typeorm";

import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";

/**
 * Guard that manages the `x-client-id` header for authenticated requests.
 *
 * This guard checks if the incoming request contains the `x-client-id` header.
 * If the header is missing, it logs a warning and allows the request to proceed.
 * If the user is found in the database, it sets the `x-client-id` header to the user's UUID.
 *
 * @example
 * // Usage in a controller
 * @UseGuards(ClientHeaderGuard)
 * @Get('profile')
 * getProfile(@Req() req) {
 *   // req.headers['x-client-id'] will be set to the user's UUID
 * }
 *
 * @see {@link https://docs.nestjs.com/guards NestJS Guards}
 * @see {@link https://typeorm.io/#/repository-api TypeORM Repository API}
 */
@Injectable()
export class ClientHeaderGuard implements CanActivate {
  /**
   * Logger instance for this guard.
   */
  private readonly logger = new Logger(ClientHeaderGuard.name);

  /**
   * Creates a new instance of ClientHeaderGuard.
   *
   * @param authRepository - The repository for accessing user entities.
   * @param jwtService - Service for handling JWT operations.
   * @param configService - Service for accessing configuration variables.
   *
   * @see {@link https://docs.nestjs.com/techniques/database NestJS Database}
   * @see {@link https://docs.nestjs.com/security/authentication NestJS Authentication}
   */
  constructor(
    @InjectRepository(UserEntity)
    private readonly authRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Determines whether the current request is allowed to proceed.
   *
   * This method checks for the presence of the `x-client-id` header in the incoming HTTP request.
   * - If the header is present, the guard logs a warning and allows the request.
   * - If the header is missing, it attempts to extract a JWT token from the Authorization header,
   *   verifies the token, and looks up the user in the database using the decoded username (email).
   * - If the user is found, it sets the `x-client-id` header to the user's UUID for both the request and response.
   * - If the user is not found or the token is missing, the guard logs a warning and allows the request.
   *
   * @param context - The execution context of the request.
   * @returns A promise that resolves to `true` if the request is allowed.
   *
   * @example
   * // The guard will set the x-client-id header if the user is found
   * await guard.canActivate(context);
   *
   * @see {@link https://docs.nestjs.com/guards NestJS Guards}
   * @see {@link https://jwt.io/ JWT Introduction}
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    if (context.getType() !== "http") {
      return true;
    }

    const clientId = request.headers["x-client-id"];
    if (clientId) {
      this.logger.warn("Request contains client ID header.");
      return true;
    }

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      this.logger.warn("No token provided in the request headers.");
      return true;
    }

    const decoded = await this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>("JWT_SECRET"),
    });

    // Find user by email (username is expected to be the email)
    const user = await this.authRepository.findOneBy({ email: decoded.username });
    if (!user) {
      this.logger.warn("No user found for the provided email.");
      return true;
    }

    // Set the x-client-id header to the user's UUID
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    res.setHeader("x-client-id", user.uuid);
    request.headers["x-client-id"] = user.uuid;
    return true;
  }

  /**
   * Extracts the JWT token from the Authorization header.
   *
   * This utility method parses the Authorization header and returns the JWT token if present.
   * The expected format is "Bearer <token>".
   *
   * @param request - The HTTP request object.
   * @returns The JWT token string if present, otherwise undefined.
   *
   * @example
   * // Example header: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   * const token = extractTokenFromHeader(request);
   * if (token) {
   *   // Use token for verification
   * }
   *
   * @see {@link https://jwt.io/ JWT Introduction}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization Authorization Header}
   */
  private extractTokenFromHeader(request: { headers: { authorization?: string } }) {
    const authHeader = request.headers.authorization;
    if (typeof authHeader !== "string") {
      return undefined;
    }
    const [type, token] = authHeader.split(" ");
    return type === "Bearer" ? token : undefined;
  }
}
