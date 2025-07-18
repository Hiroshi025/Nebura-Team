import { UserRoles } from "#/typings/user";
import { IsEmail } from "class-validator";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

import { ApiProperty } from "@nestjs/swagger";

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
    default: () => "gen_random_uuid()", // Para PostgreSQL
  })
  @ApiProperty({
    description: "UUID for the user, used for unique identification",
    example: "550e8400-e29b-41d4-a716-446655440000",
    type: "string",
  })
  uuid!: string;

  /**
   * The user's display name.
   */
  @Column()
  @ApiProperty({
    description: "The user's display name",
    example: "Alice Smith",
    type: "string",
  })
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
  role!: UserRoles;
}
