/* eslint-disable prettier/prettier */
import { randomUUID } from "crypto";
import z, { object } from "zod";

import {
	Body, Controller, Delete, Get, HttpException, HttpStatus, Post, Query
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { AuthService } from "../../routes/auth/auth.service";
import { LoginUserDto } from "../../routes/auth/dto/user/login-user.dto";
import { RegisterUserDto } from "../../routes/auth/dto/user/register.dto";

/**
 * Controller for authentication endpoints.
 *
 * This controller manages user authentication processes such as registration, login, and user retrieval.
 * It delegates business logic to {@link AuthService} and uses Swagger decorators for API documentation.
 *
 * @see {@link https://docs.nestjs.com/controllers NestJS Controllers}
 * @see {@link https://docs.nestjs.com/openapi/introduction NestJS Swagger/OpenAPI}
 * @see {@link AuthService}
 *
 * @example
 * // Register a new user
 * const user = await authController.create({ email: "test@example.com", password: "1234", name: "Test" });
 *
 * // Login a user
 * const result = await authController.login({ email: "test@example.com", password: "1234" });
 *
 * // Get user info
 * const info = await authController.getMe("user-uuid");
 */
@ApiTags("auth")
@ApiBearerAuth()
@Controller({
  path: "auth",
  version: "1",
})
export class AuthController {
  /**
   * Creates an instance of AuthController.
   *
   * @param authService - Instance of {@link AuthService} for authentication logic.
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * Registers a new user in the system.
   *
   * Validates required fields and delegates user creation to {@link AuthService#createAuth}.
   * Returns the created user entity with basic information.
   *
   * @param userData - The data for the new user, including name, email, and password.
   * @returns An object containing the user ID, a success message, and user data.
   *
   * @throws {@link HttpException} If any required field is missing.
   *
   * @see {@link RegisterUserDto}
   * @see {@link AuthService#createAuth}
   * @see {@link https://docs.nestjs.com/techniques/validation NestJS Validation}
   *
   * @example
   * const user = await authController.create({ email: "john@doe.com", password: "pass", name: "John Doe" });
   */
  @Post("register")
  async create(@Body() userData: RegisterUserDto): Promise<object> {
    if (!userData.name || !userData.email || !userData.password) {
      throw new HttpException("All fields are required", HttpStatus.BAD_REQUEST);
    }

    const uuid = randomUUID();
    const user = await this.authService.createAuth(userData, uuid);
    return {
      id: user.id,
      message: "User created successfully",
      data: user,
    };
  }

  /**
   * Authenticates a user and returns a JWT token.
   *
   * Validates input data using Zod schema and delegates authentication to {@link AuthService#loginAuth}.
   * Returns user data and authentication token.
   *
   * @param userData - The login credentials, including email and password.
   * @returns An object containing a success message, user data, and JWT token.
   *
   * @throws {@link HttpException} If email or password is missing, or if validation fails.
   *
   * @see {@link LoginUserDto}
   * @see {@link AuthService#loginAuth}
   * @see {@link https://zod.dev/ Zod Documentation}
   *
   * @example
   * const result = await authController.login({ email: "john@doe.com", password: "pass" });
   */
  @Post("login")
  async login(@Body() userData: LoginUserDto): Promise<object> {
    if (!userData.email || !userData.password) {
      throw new HttpException("Email and password are required", HttpStatus.BAD_REQUEST);
    }

    const validation = object({
      email: z.email(),
      password: z.string().min(6, "Password must be at least 6 characters long"),
    });

    const result = validation.safeParse(userData);
    if (!result.success) {
      throw new HttpException("Invalid input data", HttpStatus.BAD_REQUEST);
    }

    const { user, token } = await this.authService.loginAuth(userData.email, userData.password);
    return {
      message: "Login successful",
      data: {
        ...user,
        token,
      },
    };
  }

  /**
   * Retrieves the authenticated user's information.
   *
   * Requires the user ID as a query parameter and delegates retrieval to {@link AuthService#getAuth}.
   * Returns user data if found.
   *
   * @param id - The unique identifier of the user.
   * @returns An object containing a success message and user data.
   *
   * @throws {@link HttpException} If the ID is not provided.
   *
   * @see {@link AuthService#getAuth}
   *
   * @example
   * const info = await authController.getMe("user-uuid");
   */
  @Get("me")
  async getMe(@Query("id") id: string): Promise<object> {
    if (!id) {
      throw new HttpException("ID is required", HttpStatus.BAD_REQUEST);
    }

    // Validar que el id sea un UUID válido
    const uuidSchema = z.uuid();
    const result = uuidSchema.safeParse(id);
    if (!result.success) {
      throw new HttpException("Invalid UUID format", HttpStatus.BAD_REQUEST);
    }

    const user = await this.authService.getAuth(id);
    return {
      message: "User retrieved successfully",
      data: user,
    };
  }

  @Delete("delete")
  async deleteAuth(@Query("id") id: string): Promise<object> {
    if (!id) {
      throw new HttpException("ID is required", HttpStatus.BAD_REQUEST);
    }

    // Validar que el id sea un UUID válido
    const uuidSchema = z.uuid();
    const result = uuidSchema.safeParse(id);
    if (!result.success) {
      throw new HttpException("Invalid UUID format", HttpStatus.BAD_REQUEST);
    }

    await this.authService.deleteAuth(id);
    return {
      message: "User deleted successfully",
      data: { id },
    };
  }
}
