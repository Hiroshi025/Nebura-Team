/**
 * Service for client-related operations.
 *
 * This service provides methods to interact with client data, such as retrieving licenses
 * associated with a user. It uses TypeORM for database operations and integrates with NestJS
 * dependency injection.
 *
 * @example
 * // Inject ClientService in your controller
 * constructor(private readonly clientService: ClientService) {}
 *
 * // Get licenses for a user by UUID
 * const licenses = await clientService.getLicenses('user-uuid-string');
 *
 * @see {@link https://docs.nestjs.com/providers NestJS Providers}
 * @see {@link https://typeorm.io/ TypeORM Documentation}
 */

import { LicenseEntity } from "#entity/utils/licence.entity";
import { Repository } from "typeorm";

import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

/**
 * Injectable service for client operations.
 */
@Injectable()
export class ClientService {
  private readonly logger = new Logger(ClientService.name);

  /**
   * Creates an instance of ClientService.
   *
   * @param licenseRepository - Repository for LicenseEntity, injected by NestJS.
   */
  constructor(
    @InjectRepository(LicenseEntity)
    private readonly licenseRepository: Repository<LicenseEntity>,
  ) {}

  /**
   * Retrieves all licenses associated with a user.
   *
   * @param uuid - UUID of the user.
   * @returns Array of LicenseEntity objects.
   * @throws {NotFoundException} If no licenses are found.
   */
  async getLicenses(uuid: string): Promise<LicenseEntity[]> {
    const licenses = await this.licenseRepository.find({ where: { userId: uuid } });
    if (!licenses || licenses.length === 0) {
      this.logger.warn(`No licenses found for user: ${uuid}`);
      throw new NotFoundException("No licenses found for user");
    }
    this.logger.debug(`Licenses retrieved for user: ${uuid}`);
    return licenses;
  }

  /**
   * Retrieves a specific license by its unique identifier.
   *
   * @param identifier - Unique license identifier.
   * @returns LicenseEntity object.
   * @throws {NotFoundException} If the license is not found.
   */
  async getLicenseByIdentifier(identifier: string): Promise<LicenseEntity> {
    const license = await this.licenseRepository.findOne({ where: { identifier } });
    if (!license) {
      this.logger.warn(`License not found: ${identifier}`);
      throw new NotFoundException("License not found");
    }
    this.logger.debug(`License retrieved: ${identifier}`);
    return license;
  }

  /**
   * Resets the registered IPs for a specific license.
   *
   * @param identifier - Unique license identifier.
   * @returns Updated LicenseEntity object.
   * @throws {NotFoundException} If the license is not found.
   */
  async resetLicenseIps(identifier: string): Promise<LicenseEntity> {
    const license = await this.licenseRepository.findOne({ where: { identifier } });
    if (!license) {
      this.logger.warn(`License not found for IP reset: ${identifier}`);
      throw new NotFoundException("License not found");
    }
    license.ips = [];
    await this.licenseRepository.save(license);
    this.logger.debug(`License IPs reset: ${identifier}`);
    return license;
  }
}
