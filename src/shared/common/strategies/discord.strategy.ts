import { Done } from "#/types/sessions-types";
import { UserEntity } from "#entity/users/user.entity";
import { AuthService } from "#routes/auth/auth.service";
import { encrypt } from "#shared/webToken";
import { Profile, Strategy } from "passport-discord";
import { Repository } from "typeorm";

import { Injectable, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";

/**
 * Passport strategy for authenticating users with Discord OAuth2.
 *
 * This strategy uses the `passport-discord` library to handle Discord authentication.
 * It validates the Discord profile, updates the user entity, and triggers OAuth2 validation in the AuthService.
 *
 * @example
 * // Usage in a NestJS module
 * import { DiscordStrategy } from './discord.strategy';
 * @Module({
 *   providers: [DiscordStrategy],
 * })
 * export class AuthModule {}
 *
 * @see {@link https://docs.nestjs.com/security/authentication NestJS Authentication}
 * @see {@link https://github.com/nicholastay/passport-discord passport-discord}
 */
@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy) {
  /**
   * Logger instance for this strategy.
   */
  private readonly logger = new Logger(DiscordStrategy.name);

  /**
   * Creates a new instance of DiscordStrategy.
   *
   * @param authService - Service for handling authentication logic.
   * @param authRepository - Repository for accessing user entities.
   */
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(UserEntity)
    private readonly authRepository: Repository<UserEntity>,
  ) {
    super({
      clientID: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      callbackURL: `${process.env.BASE_URL}${process.env.DISCORD_CALLBACK_URL}`,
      scope: ["identify", "email"],
      passReqToCallback: true,
    });
  }

  /**
   * Validates the Discord OAuth2 profile and updates the user entity.
   *
   * This method is called by Passport after successful authentication.
   * It encrypts the tokens, finds the user by Discord ID, updates their Discord info,
   * and triggers further OAuth2 validation.
   *
   * @param accessToken - The Discord access token.
   * @param refreshToken - The Discord refresh token.
   * @param profile - The Discord profile object.
   * @param done - Callback to signal completion.
   * @returns Calls `done` with the profile if successful, or an error if not.
   *
   * @example
   * // Called automatically by Passport
   * await strategy.validate(accessToken, refreshToken, profile, done);
   */
  async validate(req: any, accessToken: string, refreshToken: string, profile: Profile, done: Done) {
    const encryptedRefreshToken = await encrypt(refreshToken);
    const encryptedAccessToken = await encrypt(accessToken);

    const { id, discriminator, username, avatar } = profile;

    const user = await this.authRepository
      .createQueryBuilder("user")
      .where(`"user"."discordInfo"->>'id' = :id`, { id: id })
      .andWhere(`"user"."deletedAt" IS NULL`)
      .getOne();

    if (!user) {
      this.logger.warn(`User not found for Discord ID: ${id}`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      await req.res.redirect("/dashboard/logout");
      return done(new Error("User not found"), null);
    }

    const discordInfo = {
      id: id,
      username: username,
      global_name: profile.global_name ?? null,
      discriminator: discriminator,
      avatar: avatar,
    };

    user.discordInfo = discordInfo;
    await this.authRepository.save(user);
    await this.authService.validateOAuth2({
      discordId: id,
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
    });

    console.log(profile);
    done(null, profile);
  }
}
