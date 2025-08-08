/* eslint-disable @typescript-eslint/no-unused-vars */
import { main } from "#/main";
import { FindOAuth2Params, OAuth2Details } from "#/types";
import { OAuth2Credentials } from "#entity/users/auth/oauth2-credentials.entity";
import { UserEntity } from "#entity/users/user.entity";
import { encrypt } from "#shared/webToken";
import { compare } from "bcryptjs";
import Qrcode from "qrcode";
import { Repository } from "typeorm";

import {
	HttpException, HttpStatus, Injectable, InternalServerErrorException, Logger, NotFoundException
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";

import { RegisterUserDto } from "../dto/user/register.dto";

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
    private readonly jwtService: JwtService,
    private eventEmitter: EventEmitter2,
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

      const dataJson = JSON.stringify({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        uuid,
      });

      const qrcode = await Qrcode.toDataURL(dataJson);
      const user = this.authRepository.create({
        ...userData,
        password,
        uuid,
        qrCodeBase64: qrcode,
      });

      await this.authRepository.save(user).then((savedUser) => {
        main.logger.debug(`User created with ID: ${savedUser.id}`);
      });

      this.logger.debug(`User created with ID: ${user.id}`);
      this.eventEmitter.emit("user.created", user);
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

      const verifiedPassword = await compare(password, user.password);
      if (!verifiedPassword) {
        throw new HttpException("Invalid credentials", HttpStatus.UNAUTHORIZED);
      }

      const payload = { sub: user.id, username: user.email, role: user.role };
      const token = this.jwtService.sign(payload);

      this.logger.debug(`User logged in with ID: ${user.id}`);
      return {
        user: { ...user, password: undefined },
        token,
      };
    } catch (error) {
      this.logger.error("Error during login", error);
      throw new HttpException("Login failed", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Retrieves a user by their UUID.
   *
   * @param uuid - The UUID of the user to retrieve.
   * @returns The UserEntity corresponding to the provided UUID.
   */
  async getAuth(uuid: string): Promise<UserEntity> {
    try {
      const user = await this.authRepository.findOne({ where: { uuid } });
      if (!user) {
        throw new NotFoundException("User not found");
      }

      this.logger.debug(`User retrieved with ID: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error("Error retrieving user", error);
      throw new InternalServerErrorException("Error retrieving user");
    }
  }

  /**
   * Deletes a user by their UUID.
   *
   * @param uuid - The UUID of the user to delete.
   * @returns A promise that resolves when the user is deleted.
   * @throws {HttpException} If the user is not found or if there is an error during deletion.
   */
  async deleteAuth(uuid: string): Promise<void> {
    try {
      const user = await this.authRepository.findOne({ where: { uuid } });
      if (!user) {
        throw new NotFoundException("User not found");
      }

      await this.authRepository.remove(user);
      this.logger.debug(`User deleted with ID: ${user.id}`);
      return;
    } catch (error) {
      this.logger.error("Error deleting user", error);
      throw new InternalServerErrorException("Error deleting user");
    }
  }

  /**
   * Validates a user by their UUID and password.
   *
   * @param uuid - The UUID of the user to validate.
   * @param pass - The password of the user to validate.
   * @returns The validated user or null if validation fails.
   */
  async validateUser(uuid: string, pass: string): Promise<any> {
    const user = await this.authRepository.findOne({ where: { uuid } });
    if (user && (await compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * Validates OAuth2 credentials and either creates or updates them.
   *
   * @param details - The OAuth2 credential details to validate.
   * @returns The created or updated OAuth2 credential.
   */
  async validateOAuth2(details: OAuth2Details) {
    const { discordId } = details;
    const oauth2 = await this.findOAuth2({ discordId });
    return oauth2 ? this.updateOAuth2(details) : this.createOAuth2(details);
  }

  /**
   * Creates a new OAuth2 credential with the provided details.
   * @param details - The OAuth2 credential details to create.
   * @returns The created OAuth2 credential.
   * @throws {HttpException} If there is an error during creation.
   */
  createOAuth2(details: OAuth2Details) {
    const oauth2Repository = this.authRepository.manager.getRepository(OAuth2Credentials);
    const user = oauth2Repository.create(details);
    return oauth2Repository.save(user);
  }

  /**
   * Updates an existing OAuth2 credential with the provided details.
   * @param details - The OAuth2 credential details to update.
   * @returns The updated OAuth2 credential.
   * @throws {HttpException} If there is an error during the update.
   */
  async updateOAuth2(details: OAuth2Details) {
    const oauth2Repository = this.authRepository.manager.getRepository(OAuth2Credentials);
    await oauth2Repository.update(details.discordId, details);
    return details;
  }

  /**
   * Finds an OAuth2 credential by the provided parameters.
   * @param params - The parameters to find the OAuth2 credential.
   * @return The found OAuth2 credential or undefined if not found.
   *
   */
  findOAuth2(params: FindOAuth2Params) {
    const oauth2Repository = this.authRepository.manager.getRepository(OAuth2Credentials);
    return oauth2Repository.findOne({ where: params });
  }
}
