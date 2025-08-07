import { LicenceCreateType, LicenceUpdateType } from "#adapters/schemas/licence.schema";
import { UserEntity } from "#entity/users/user.entity";
import { LicenseEntity } from "#entity/utils/licence.entity";
import { Repository } from "typeorm";

import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

/**
 * Service for managing software licences.
 *
 * Provides CRUD operations and search functionality for {@link LicenseEntity} objects.
 * Uses TypeORM for database interaction and is injectable in NestJS controllers.
 *
 * @example
 * ```ts
 * // Inject LicenceService in a controller
 * constructor(private readonly licenceService: LicenceService) {}
 *
 * // Create a new licence
 * const newLicence = await licenceService.create({
 *   identifier: "LIC-001",
 *   key: "KEY-123",
 *   type: LicenseType.BASIC,
 *   userId: "user-001",
 *   adminId: "admin-001",
 *   validUntil: new Date("2025-01-01"),
 * });
 *
 * // Find all licences
 * const licences = await licenceService.findAll();
 * ```
 *
 * @see {@link https://docs.nestjs.com/providers NestJS Providers}
 * @see {@link https://typeorm.io/#/repository-api TypeORM Repository API}
 */
@Injectable()
export class LicenceService {
  /**
   * Creates an instance of LicenceService.
   * @param licenceRepository Repository for {@link LicenseEntity}.
   */
  constructor(
    @InjectRepository(LicenseEntity)
    private readonly licenceRepository: Repository<LicenseEntity>,
  ) {}

  /**
   * Retrieves all licences from the database.
   * @returns Array of {@link LicenseEntity} objects.
   *
   * @example
   * ```ts
   * const licences = await licenceService.findAll();
   * ```
   */
  async findAll(): Promise<LicenseEntity[]> {
    return this.licenceRepository.find();
  }

  /**
   * Finds a licence by its unique ID.
   * @param id Licence UUID.
   * @returns The found {@link LicenseEntity}.
   * @throws NotFoundException if licence does not exist.
   *
   * @example
   * ```ts
   * const licence = await licenceService.findOne("550e8400-e29b-41d4-a716-446655440000");
   * ```
   */
  async findOne(id: string): Promise<LicenseEntity> {
    const licence = await this.licenceRepository.findOne({ where: { id } });
    if (!licence) throw new NotFoundException("Licence not found");
    return licence;
  }

  /**
   * Creates a new licence in the database.
   * @param data Licence creation payload.
   * @returns The created {@link LicenseEntity}.
   *
   * @example
   * ```ts
   * const licence = await licenceService.create({
   *   identifier: "LIC-001",
   *   key: "KEY-123",
   *   type: LicenseType.BASIC,
   *   userId: "user-001",
   *   adminId: "admin-001",
   *   validUntil: new Date("2025-01-01"),
   * });
   * ```
   */
  async create(data: LicenceCreateType): Promise<LicenseEntity> {
    const licence = this.licenceRepository.create(data);
    const savedLicence = await this.licenceRepository.save(licence);
    const userRepo = this.licenceRepository.manager.getRepository(UserEntity);
    const user = await userRepo.findOne({ where: { uuid: data.userId } });
    if (user) {
      if (!user.licenses) user.licenses = [];
      user.licenses.push(savedLicence);
      await userRepo.save(user);
    }

    return savedLicence;
  }

  /**
   * Updates an existing licence by ID.
   * @param id Licence UUID.
   * @param data Licence update payload.
   * @returns The updated {@link LicenseEntity}.
   * @throws NotFoundException if licence does not exist.
   *
   * @example
   * ```ts
   * const updated = await licenceService.update("550e8400-e29b-41d4-a716-446655440000", { requestLimit: 2000 });
   * ```
   */
  async update(id: string, data: LicenceUpdateType) {
    const licence = await this.findOne(id);
    Object.assign(licence, data);
    await this.licenceRepository.save(licence);

    const userRepo = this.licenceRepository.manager.getRepository(UserEntity);
    const user = await userRepo.findOne({ where: { uuid: licence.userId } });
    if (!user) throw new NotFoundException("User not found");

    if (user.licenses) {
      user.licenses = user.licenses.map(l => (l.id === licence.id ? licence : l));
      await userRepo.save(user);
    }

    return licence;
  }

  /**
   * Removes a licence by ID.
   * @param id Licence UUID.
   * @returns void
   * @throws NotFoundException if licence does not exist.
   *
   * @example
   * ```ts
   * await licenceService.remove("550e8400-e29b-41d4-a716-446655440000");
   * ```
   */
  async remove(id: string): Promise<void> {
    const licence = await this.findOne(id);
    await this.licenceRepository.remove(licence);
    const userRepo = this.licenceRepository.manager.getRepository(UserEntity);
    const user = await userRepo.findOne({ where: { uuid: licence.userId } });
    if (user && user.licenses) {
      user.licenses = user.licenses.filter(l => l.id !== licence.id);
      await userRepo.save(user);
    }
  }

  /**
   * Removes all licences from the database.
   * @returns void
   *
   * @example
   * ```ts
   * await licenceService.removeAll();
   * ```
   */
  async removeAll(): Promise<void> {
    await this.licenceRepository.clear();
    const userRepo = this.licenceRepository.manager.getRepository(UserEntity);
    const users = await userRepo.find();
    for (const user of users) {
      user.licenses = [];
      await userRepo.save(user);
    }
  }

  /**
   * Finds a licence by its unique identifier.
   * @param identifier Licence identifier string.
   * @returns The found {@link LicenseEntity}.
   * @throws NotFoundException if licence does not exist.
   *
   * @example
   * ```ts
   * const licence = await licenceService.findByIdentifier("LIC-001");
   * ```
   */
  async findByIdentifier(identifier: string): Promise<LicenseEntity> {
    const licence = await this.licenceRepository.findOne({ where: { identifier } });
    if (!licence) throw new NotFoundException("Licence not found");
    return licence;
  }
}
