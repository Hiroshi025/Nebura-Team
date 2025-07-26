import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    interface AuthenticatedRequest {
      headers: { authorization?: string };
      user?: any;
    }
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      this.logger.warn("No token provided in the request headers.");
      return false;
    }

    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>("JWT_SECRET"),
      });
      request.user = decoded;
      return true;
    } catch (error: any) {
      this.logger.error("Token verification failed:", error.message);
      return false;
    }
  }

  private extractTokenFromHeader(request: { headers: { authorization?: string } }) {
    const authHeader = request.headers.authorization;
    if (typeof authHeader !== "string") {
      return undefined;
    }
    const [type, token] = authHeader.split(" ");
    return type === "Bearer" ? token : undefined;
  }
}
