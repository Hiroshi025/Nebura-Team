/* eslint-disable @typescript-eslint/await-thenable */
import { RoleValidSchema } from "#adapters/schemas/shared/role.schema";
import { UserRole } from "#common/typeRole";
// import UserRoles as a value, not just a type
import { UserEntity } from "#entity/users/user.entity";
import { LicenseEntity } from "#entity/utils/licence.entity";
import { In, Repository } from "typeorm";

import {
	BadRequestException, HttpException, HttpStatus, Injectable, Logger, NotFoundException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  /**
   * Constructs the UserService.
   *
   * @param userRepository - The repository for UserEntity, injected by NestJS.
   * @see {@link https://docs.nestjs.com/techniques/database#repositories NestJS Repositories}
   */
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Updates the role of a user.
   *
   * @param userData - Partial user entity containing at least the uuid and the new role.
   * @returns The updated user entity.
   * @throws {HttpException} If the user is not found or the role is invalid.
   *
   * @see {@link https://docs.nestjs.com/exception-filters NestJS Exception Filters}
   */
  async updateRole(userData: Partial<UserEntity>) {
    try {
      const user = await this.userRepository.findOneBy({ uuid: userData.uuid });
      if (!user) throw new HttpException("User not found", HttpStatus.NOT_FOUND);

      const validRol = RoleValidSchema.safeParse({ role: userData.role });
      if (!validRol.success) {
        throw new HttpException("Invalid role", HttpStatus.BAD_REQUEST, {
          cause: validRol.error.message,
          description: "Role must be one of the valid user roles",
        });
      }

      await this.userRepository.save({
        ...user,
        role: userData.role,
      });
      this.logger.log(`Updated role for user with ID ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to update role for user with ID ${userData.id}`, error);
      throw new HttpException("Failed to update user role", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Finds a user by their UUID.
   *
   * @param uuid - The UUID of the user to search for.
   * @returns The user entity if found, otherwise throws an exception.
   * @throws {HttpException} If the user is not found or a database error occurs.
   */
  async findByUuid(uuid: string): Promise<UserEntity | null> {
    try {
      const user = await this.userRepository.findOneBy({ uuid });
      if (!user) throw new HttpException("User not found", HttpStatus.NOT_FOUND);
      return user;
    } catch (error) {
      this.logger.error(`Error finding user with ID ${uuid}`, error);
      throw new HttpException("Failed to find user", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Finds a user by their username.
   *
   * @param username - The username of the user to search for.
   * @returns The user entity if found, otherwise throws an exception.
   * @throws {HttpException} If the user is not found or a database error occurs.
   */
  async findByUsername(username: string): Promise<UserEntity | null> {
    try {
      const user = await this.userRepository.findOneBy({ name: username });
      if (!user) throw new HttpException("User not found", HttpStatus.NOT_FOUND);
      return user;
    } catch (error) {
      this.logger.error(`Error finding user with username ${username}`, error);
      throw new HttpException("Failed to find user", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Retrieves all users from the database.
   *
   * @returns An array containing all user entities.
   * @throws {HttpException} If there is an error retrieving users from the database.
   */
  async findAll(): Promise<UserEntity[]> {
    try {
      const users = await this.userRepository.find();
      return users;
    } catch (error) {
      this.logger.error("Error finding all users", error);
      throw new HttpException("Failed to find users", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Deletes all users with roles "user" or "client" from the database.
   *
   * Requires the UUID of an admin user to authorize the operation.
   *
   * @param uuid - The UUID of the admin user requesting the deletion.
   * @throws {HttpException} If the admin user is not found or a database error occurs.
   */
  async deleteAll(uuid: string): Promise<void> {
    try {
      const adminUser = await this.findByUuid(uuid);
      if (!adminUser) throw new HttpException("Admin user not found", HttpStatus.NOT_FOUND);

      const validRoles: UserRole[] = [UserRole.USER, UserRole.CLIENT];
      const usersToDelete = await this.userRepository.find({ where: { role: In(validRoles) } });
      await this.userRepository.remove(usersToDelete);
      this.logger.log("All users deleted successfully");
    } catch (error) {
      this.logger.error("Error deleting all users", error);
      throw new HttpException("Failed to delete users", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Validates a software licence.
   * @param key - Licence key.
   * @param identifier - Unique licence identifier.
   * @param ip - IP address from which the request is made.
   */
  async validateLicence(key: string, identifier: string, ip: string) {
    const licenceRepository = await this.userRepository.manager.getRepository(LicenseEntity);
    const licence = await licenceRepository.findOne({ where: { key, identifier } });
    if (!licence) throw new HttpException("Licence not found", HttpStatus.NOT_FOUND);

    if (licence.validUntil < new Date())
      throw new BadRequestException("Licence expired", {
        cause: new Error("Licence expired"),
        description: "The licence has expired and is no longer valid.",
      });

    if (licence.requestCount >= licence.requestLimit)
      throw new BadRequestException("Request limit exceeded", {
        cause: new Error("Request limit exceeded"),
        description: "The number of requests has exceeded the allowed limit.",
      });

    if (!licence.ips) licence.ips = [];
    if (!licence.ips.includes(ip)) {
      if (licence.ips.length >= (licence.maxIps ?? 5))
        throw new BadRequestException("Maximum IPs reached", {
          cause: new Error("Maximum IPs reached"),
          description: "The licence has reached the maximum number of allowed IPs.",
        });
      licence.ips.push(ip);
    }

    licence.requestCount += 1;
    await licenceRepository.save(licence);

    return {
      key: licence.key,
      identifier: licence.identifier,
      type: licence.type,
      validUntil: licence.validUntil,
      requestCount: licence.requestCount,
      requestLimit: licence.requestLimit,
      ips: licence.ips,
      maxIps: licence.maxIps,
    };
  }

  /**
   * Converts a user to a client by setting isClient to true.
   *
   * @param uuid - The UUID of the user to convert.
   * @returns The updated user entity, or null if not found.
   */
  async convertToClient(uuid: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOneBy({ uuid });
    if (!user)
      throw new NotFoundException(`User with UUID ${uuid} not found`, {
        cause: new Error("User not found"),
        description: "The user with the specified UUID does not exist.",
      });

    if (user.isClient) {
      this.logger.warn(`User with UUID ${uuid} is already a client`);
      return user; // No changes needed if already a client
    }

    user.isClient = true;
    await this.userRepository.save(user);
    return user;
  }
}
