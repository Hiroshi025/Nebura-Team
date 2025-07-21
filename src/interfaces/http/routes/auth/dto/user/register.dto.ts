import { IsEmail, IsNotEmpty, IsString } from "class-validator";

import { ApiProperty } from "@nestjs/swagger";

/**
 * Data Transfer Object for user registration requests.
 *
 * This DTO is used to validate and transfer user registration data from the client to the authentication endpoint.
 *
 * @see {@link https://docs.nestjs.com/pipes NestJS Pipes}
 * @see {@link https://github.com/typestack/class-validator class-validator}
 *
 * @example
 * {
 *   "name": "John Doe",
 *   "email": "john.doe@example.com",
 *   "password": "strongPassword123"
 * }
 */
export class RegisterUserDto {
  /**
   * User's full name.
   *
   * This field is required and must not be empty.
   *
   * @see {@link https://github.com/typestack/class-validator#isnotempty IsNotEmpty}
   */
  @ApiProperty({
    description: "The full name of the user",
    example: "John Doe",
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly name!: string;

  /**
   * User's email address.
   *
   * This field is required and must not be empty.
   *
   * @see {@link https://github.com/typestack/class-validator#isnotempty IsNotEmpty}
   */
  @ApiProperty({
    description: "The email address of the user",
    example: "john.doe@example.com",
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
    example: "strongPassword123",
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly password!: string;
}
