import { IsNotEmpty, IsString, MinLength } from "class-validator";
import { ISession } from "connect-typeorm/out";
import { Column, Entity, Index, PrimaryColumn } from "typeorm";

import { ApiProperty } from "@nestjs/swagger";

/**
 * Represents a session entity stored in the database.
 *
 * This entity is used to persist session data for users.
 * It implements the {@link ISession} interface from [connect-typeorm](https://github.com/lynxtp/connect-typeorm).
 *
 * @example
 * const session = new SessionEntity();
 * session.id = "session_1234567890abcdef";
 * session.expiredAt = Date.now() + 3600 * 1000; // Expires in 1 hour
 * session.json = JSON.stringify({ userId: "1234567890", expires: "2023-12-31T23:59:59Z" });
 */
@Entity({ name: "sessions" })
export class SessionEntity implements ISession {
  /**
   * The timestamp (in milliseconds) when the session expires.
   *
   * Indexed for efficient queries.
   *
   * @type {number}
   * @default Date.now()
   * @example
   * 1717430400000
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now
   */
  @Index()
  @Column("bigint", { default: Date.now() })
  expiredAt!: number;

  /**
   * Unique identifier for the session.
   *
   * This is the primary key for the entity.
   *
   * @type {string}
   * @example
   * "session_1234567890abcdef"
   *
   * @see https://docs.nestjs.com/openapi/types-and-parameters
   */
  @PrimaryColumn("varchar", { length: 255 })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @ApiProperty({
    description: "Session ID. Unique identifier for the session.",
    example: "session_1234567890abcdef",
    type: String,
  })
  id!: string;

  /**
   * JSON string containing session data.
   *
   * Typically includes user information and expiration details.
   *
   * @type {string}
   * @example
   * '{"userId": "1234567890", "expires": "2023-12-31T23:59:59Z"}'
   *
   * @see https://docs.nestjs.com/openapi/types-and-parameters
   */
  @Column("text")
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "Session JSON data. Contains serialized session information.",
    example: '{"userId": "1234567890", "expires": "2023-12-31T23:59:59Z"}',
    type: String,
  })
  json!: string;
}
