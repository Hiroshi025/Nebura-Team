import { UserRole } from "#common/typeRole";
import { IsBoolean, IsDate, IsEmail, IsString, IsUUID } from "class-validator";
import { BaseEntity, Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * Represents a user in the authentication system.
 *
 * This entity is mapped to the database and includes basic user information.
 *
 * @example
 * const user = new UserEntity();
 * user.name = "Alice";
 * user.email = "alice@example.com";
 * user.password = "securepassword";
 * user.role = "admin";
 * await user.save();
 *
 * @see https://typeorm.io/#/entities
 */
@Entity()
export class UserEntity extends BaseEntity {
  /**
   * Unique identifier for the user.
   */
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: "Unique identifier for the user",
    example: 1,
    type: "integer",
  })
  id!: number;

  /**
   * UUID for the user, used for unique identification.
   * Optional field that can be used for external references.
   */
  @Column({
    type: "uuid",
    unique: true,
    nullable: false,
    default: () => "gen_random_uuid()", // For PostgreSQL
  })
  @ApiProperty({
    description: "UUID for the user, used for unique identification",
    example: "550e8400-e29b-41d4-a716-446655440000",
    type: "string",
  })
  @IsUUID()
  uuid!: string;

  /**
   * Base64 encoded QR code for the user.
   * This can be used for authentication or identification purposes.
   */
  @Column({ nullable: true })
  @ApiProperty({
    description: "Base64 encoded QR code for the user",
    example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...",
    type: "string",
  })
  @IsString()
  qrCodeBase64!: string;

  /**
   * The user's display name.
   */
  @Column()
  @ApiProperty({
    description: "The user's display name",
    example: "Alice Smith",
    type: "string",
  })
  @IsString()
  name!: string;

  /**
   * The user's email address.
   * Must be a valid email format.
   */
  @Column({ unique: true })
  @IsEmail()
  @ApiProperty({
    description: "The user's email address",
    example: "example@gmail.com",
  })
  email!: string;

  /**
   * The user's hashed password.
   */
  @Column()
  @ApiProperty({
    description: "The user's hashed password",
    example: "$2b$10$EIX/3Z5z1Q8e1a5f6d7e8uO9jK5h6k7l8m9n0oPqRstUvwxyz1234",
    type: "string",
  })
  @IsString()
  password!: string;

  /**
   * The user's role in the system.
   * Defaults to "user".
   */
  @Column({ default: "user" })
  @ApiProperty({
    description: "The user's role in the system",
    example: "user",
    type: "string",
  })
  role!: UserRole;

  /**
   * Optional field for storing additional information about the user.
   * Can be used for storing metadata or preferences.
   * Each license is represented as an object.
   */
  @Column("jsonb", { nullable: true })
  @ApiPropertyOptional({
    description: "Array of license objects for the user",
    example: [
      { type: "premium", issuedAt: "2024-01-01" },
      { type: "basic", issuedAt: "2023-05-10" },
    ],
    type: "array",
    items: { type: "object", additionalProperties: true },
  })
  licenses?: Record<string, any>[];

  /**
   * Optional field for storing Discord-related information.
   * This can include user IDs, roles, or other Discord-specific data.
   */
  @Column("jsonb", { nullable: true })
  @ApiPropertyOptional({
    description: "Discord-related information for the user",
    type: "object",
    additionalProperties: true,
    example: {
      id: "123456789012345678",
      username: "exampleUser",
      discriminator: "1234",
      avatar: "https://cdn.discordapp.com/avatars/123456789012345678/abcdef1234567890.png",
    },
  })
  discordInfo?: Record<string, any>;

  /**
   * Indicates whether the user is a client.
   * This can be used to differentiate between regular users and clients.
   */
  @Column({ default: false })
  @ApiProperty({
    description: "Indicates whether the user is a client",
    example: false,
    type: "boolean",
  })
  @IsBoolean()
  isClient?: boolean;

  /**
   * Timestamp when the user was deleted.
   * Automatically set to the current date and time when the record is deleted.
   */
  @DeleteDateColumn()
  @ApiProperty({
    description: "Timestamp when the user was deleted",
    example: "2023-10-01T12:00:00Z",
    type: "string",
  })
  @IsDate()
  deletedAt!: Date;

  /**
   * Array of tickets created by the user.
   */
  @Column("jsonb", { nullable: true })
  tickets?: Record<string, any>[];
}
