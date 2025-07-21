import { ROLES_KEY } from "#common/decorators/role.decorator";
import { Observable } from "rxjs";

import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RoleGuard implements CanActivate {
  private readonly logger = new Logger(RoleGuard.name);
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!roles || roles.length === 0) {
      this.logger.warn("No roles defined for this route, access granted by default");
      return true;
    }

    if (!user || !user.role) {
      this.logger.warn("User not authenticated or role not found");
      return false;
    }

    return roles.includes(user.role as string);
  }
}
