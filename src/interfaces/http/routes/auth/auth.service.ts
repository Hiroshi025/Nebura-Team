import { main } from "#/main";
import { UserEntity } from "#entity/auth/user.entity";
import { encrypt, signToken, verified } from "#shared/webToken";
import { Repository } from "typeorm";

import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { RegisterUserDto } from "./dto/user/register.dto";

/**
 * Service for authentication-related operations.
 * Handles user creation and interacts with the UserEntity repository.
 *
 * @see https://docs.nestjs.com/providers
 * @see https://typeorm.io/#/repository-api
 *
 * @example
 * const user = await authService.createUser({ email: "test@example.com", password: "1234", name: "Test" });
 */
@Injectable()
export class AuthService {
  /**
   * Logger instance for logging messages related to authentication operations.
   * This logger is used to log debug, info, warning, and error messages.
   */
  private readonly logger = new Logger(AuthService.name);
  /**
   * Creates an instance of AuthService.
   *
   * @param userRepository - Injected TypeORM repository for UserEntity.
   */
  constructor(
    @InjectRepository(UserEntity)
    private readonly authRepository: Repository<UserEntity>,
  ) {}

  /**
   * Creates a new user in the database.
   *
   * @param userData - Data Transfer Object containing user registration information.
   * @returns The newly created UserEntity.
   * @throws {HttpException} If there is an error during user creation.
   *
   * @example
   * const user = await authService.createUser({ email: "john@doe.com", password: "pass", name: "John Doe" });
   */
  async createAuth(userData: RegisterUserDto, uuid: string): Promise<UserEntity> {
    try {
      const data = await this.authRepository.findOne({ where: { email: userData.email } });
      if (data) throw new HttpException("User already exists", HttpStatus.BAD_REQUEST);

      const password = await encrypt(userData.password);
      if (!password) throw new HttpException("Password encryption failed", HttpStatus.INTERNAL_SERVER_ERROR);
      const user = this.authRepository.create({
        ...userData,
        password,
        uuid,
      });

      await this.authRepository.save(user).then((savedUser) => {
        main.logger.debug(`User created with ID: ${savedUser.id}`);
      });

      this.logger.log(`User created with ID: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error("Error creating user", error);
      throw new HttpException("Error creating user", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Logs in a user with the provided email and password.
   *
   * @param email - The email of the user.
   * @param password - The password of the user.
   * @returns An object containing the user information and a JWT token.
   * @throws {HttpException} If the user is not found or if the credentials are invalid.
   */
  async loginAuth(email: string, password: string): Promise<{ user: Partial<UserEntity>; token: string }> {
    try {
      const user = await this.authRepository.findOne({ where: { email } });
      if (!user) {
        throw new HttpException("User not found", HttpStatus.NOT_FOUND);
      }

      const verifiedPassword = await verified(password, user.password);
      if (!verifiedPassword) {
        throw new HttpException("Invalid credentials", HttpStatus.UNAUTHORIZED);
      }

      const token = signToken(String(user.id));

      this.logger.log(`User logged in with ID: ${user.id}`);
      return { user: { ...user }, token };
    } catch (error) {
      this.logger.error("Error during login", error);
      throw new HttpException("Login failed", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAuth(uuid: string): Promise<UserEntity> {
    try {
      const user = await this.authRepository.findOne({ where: { uuid } });
      if (!user) {
        throw new HttpException("User not found", HttpStatus.NOT_FOUND);
      }

      this.logger.log(`User retrieved with ID: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error("Error retrieving user", error);
      throw new HttpException("Error retrieving user", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteAuth(uuid: string): Promise<void> {
    try {
      const user = await this.authRepository.findOne({ where: { uuid } });
      if (!user) {
        throw new HttpException("User not found", HttpStatus.NOT_FOUND);
      }

      await this.authRepository.remove(user);
      this.logger.log(`User deleted with ID: ${user.id}`);
      return;
    } catch (error) {
      this.logger.error("Error deleting user", error);
      throw new HttpException("Error deleting user", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
