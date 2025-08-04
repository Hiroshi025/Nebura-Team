/* eslint-disable @typescript-eslint/no-unused-vars */
import { main } from "#/main";
import { FindOAuth2Params, OAuth2Details } from "#/types/sessions-types";
import { OAuth2Credentials } from "#entity/users/Oauth2-credentials.entity";
import { UserEntity } from "#entity/users/user.entity";
import { encrypt } from "#shared/webToken";
import { compare } from "bcryptjs";
import Qrcode from "qrcode";
import { Repository } from "typeorm";

import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { JwtService } from "@nestjs/jwt";
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

      this.logger.log(`User created with ID: ${user.id}`);
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

      this.logger.log(`User logged in with ID: ${user.id}`);
      return {
        user: { ...user, password: undefined },
        token,
      };
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

  async validateUser(uuid: string, pass: string): Promise<any> {
    const user = await this.authRepository.findOne({ where: { uuid } });
    if (user && (await compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async validateOAuth2(details: OAuth2Details) {
    const { discordId } = details;
    const oauth2 = await this.findOAuth2({ discordId });
    return oauth2 ? this.updateOAuth2(details) : this.createOAuth2(details);
  }

  createOAuth2(details: OAuth2Details) {
    const oauth2Repository = this.authRepository.manager.getRepository(OAuth2Credentials);
    const user = oauth2Repository.create(details);
    return oauth2Repository.save(user);
  }

  async updateOAuth2(details: OAuth2Details) {
    const oauth2Repository = this.authRepository.manager.getRepository(OAuth2Credentials);
    await oauth2Repository.update(details.discordId, details);
    return details;
  }

  findOAuth2(params: FindOAuth2Params) {
    const oauth2Repository = this.authRepository.manager.getRepository(OAuth2Credentials);
    return oauth2Repository.findOne({ where: params });
  }
}
