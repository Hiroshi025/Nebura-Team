import { UserEntity } from "#adapters/database/entities/users/user.entity";
import { Repository } from "typeorm";

import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

/**
 * Guard that allows access only to users with the `isClient` property set to `true`.
 *
 * This guard checks if the authenticated user is a client by verifying the `isClient` property
 * in the {@link UserEntity}. If the user is not found or is not a client, access is denied.
 *
 * @example
 * // Usage in a controller
 * \@UseGuards(ClientGuard)
 * \@Get('client-data')
 * getClientData() {
 *   // Only accessible by users with isClient === true
 * }
 *
 * @see [NestJS Guards Documentation](https://docs.nestjs.com/guards)
 * @see [TypeORM Repository](https://typeorm.io/repository-api)
 */
@Injectable()
export class ClientGuard implements CanActivate {
  /**
   * Logger instance for the guard.
   * @private
   */
  private readonly logger = new Logger(ClientGuard.name);

  /**
   * Creates an instance of ClientGuard.
   * @param userRepository The repository for accessing user entities.
   */
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Determines whether the current user can activate the route.
   *
   * @param context The execution context containing the request.
   * @returns A promise that resolves to `true` if the user is a client, otherwise `false`.
   *
   * @example
   * // Example usage in a controller
   * \@UseGuards(ClientGuard)
   * \@Get('client-endpoint')
   * getClientResource() {
   *   // Only accessible to clients
   * }
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      this.logger.warn("No user found in request");
      return false;
    }

    const userId = user.id;
    const data = await this.userRepository.findOne({ where: { id: userId } });
    if (!data) {
      this.logger.warn(`User with ID ${userId} not found`);
      return false;
    }

    if (!data.isClient) {
      this.logger.warn(`User with ID ${userId} is not a client`);
      return false;
    }

    return true;
  }
}
