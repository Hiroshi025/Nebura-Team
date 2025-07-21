import { AuthService } from "#routes/auth/auth.service";
import { Strategy } from "passport-local";

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: "uuid",
      passwordField: "password",
    });
  }

  async validate(uuid: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(uuid, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
