import { IsString } from "class-validator";
import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

import { ApiProperty } from "@nestjs/swagger";

/**
 * Represents OAuth2 credentials for a Discord user.
 *
 * This entity stores the Discord user's ID and their OAuth2 access and refresh tokens.
 *
 * @see https://discord.com/developers/docs/topics/oauth2
 * @see https://docs.nestjs.com/openapi/types-and-parameters
 *
 * @example
 * const credentials = new OAuth2Credentials();
 * credentials.discordId = "123456789012345678";
 * credentials.accessToken = "abc123xyz456";
 * credentials.refreshToken = "xyz456abc123";
 */
@Entity({ name: "oauth2" })
export class OAuth2Credentials extends BaseEntity {
  /**
   * Discord ID of the user.
   *
   * This is the primary key for the entity.
   *
   * @type {string}
   * @example
   * "123456789012345678"
   *
   * @see https://discord.com/developers/docs/reference#snowflakes
   */
  @PrimaryColumn({ name: "discord_id" })
  @IsString()
  @ApiProperty({
    description: "Discord ID of the user. Unique identifier for Discord accounts.",
    example: "123456789012345678",
    type: String,
  })
  discordId!: string;

  /**
   * Access token for OAuth2 authentication.
   *
   * Used to authorize requests on behalf of the user.
   *
   * @type {string}
   * @example
   * "abc123xyz456"
   *
   * @see https://discord.com/developers/docs/topics/oauth2#authorization-code-grant-access-token-response
   */
  @Column({ name: "access_token" })
  @IsString()
  @ApiProperty({
    description: "Access token for OAuth2. Used for authenticating API requests.",
    example: "abc123xyz456",
    type: String,
  })
  accessToken!: string;

  /**
   * Refresh token for OAuth2 authentication.
   *
   * Used to obtain new access tokens when the current one expires.
   *
   * @type {string}
   * @example
   * "xyz456abc123"
   *
   * @see https://discord.com/developers/docs/topics/oauth2#authorization-code-grant-refresh-token-exchange-example
   */
  @Column({ name: "refresh_token" })
  @IsString()
  @ApiProperty({
    description: "Refresh token for OAuth2. Used to renew access tokens.",
    example: "xyz456abc123",
    type: String,
  })
  refreshToken!: string;
}
