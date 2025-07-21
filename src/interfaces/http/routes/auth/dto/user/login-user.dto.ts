import { IsEmail, IsNotEmpty, IsString } from "class-validator";

import { ApiProperty } from "@nestjs/swagger";

/**
 * Data Transfer Object for user login requests.
 *
 * This DTO is used to validate and transfer login credentials from the client to the authentication endpoint.
 *
 * @see {@link https://docs.nestjs.com/pipes NestJS Pipes}
 * @see {@link https://github.com/typestack/class-validator class-validator}
 *
 * @example
 * {
 *   "email": "user@example.com",
 *   "password": "securePassword123"
 * }
 */
export class LoginUserDto {
  /**
   * User's email address.
   *
   * This field is required and must not be empty.
   *
   * @see {@link https://github.com/typestack/class-validator#isnotempty IsNotEmpty}
   */
  @ApiProperty({
    description: "The email address of the user",
    example: "user@example.com",
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email!: string;

  /**
   * User's password.
   *
   * This field is required and must not be empty.
   *
   * @see {@link https://github.com/typestack/class-validator#isnotempty IsNotEmpty}
   */
  @ApiProperty({
    description: "The password of the user",
    example: "securePassword123",
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly password!: string;
}
