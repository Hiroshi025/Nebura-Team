/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { IPBlockerEntity } from "#entity/admin/ips-blocker.entity";
import { CreateIPBlockerDto } from "#routes/admin/dto/create-ip.dto";
import { UpdateIPBlockerDto } from "#routes/admin/dto/update-ip.dto";
import { MoreThanOrEqual, Repository } from "typeorm";

import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";

/**
 * Service for managing blocked IP addresses.
 * Provides CRUD operations and search functionality for {@link IPBlocker} objects.
 */
@Injectable()
export class IPBlockerService {
  private readonly logger = new Logger(IPBlockerService.name);
  /**
   * Creates an instance of IPBlockerService.
   * @param ipBlockerRepository Repository for {@link IPBlocker}.
   */
  constructor(
    @InjectRepository(IPBlockerEntity)
    private readonly ipBlockerRepository: Repository<IPBlockerEntity>,
  ) {}

  /**
   * Retrieves all blocked IPs from the database.
   * @returns Array of {@link IPBlocker} objects.
   */
  async findAll(): Promise<IPBlockerEntity[]> {
    this.logger.debug("Retrieving all blocked IPs");
    return this.ipBlockerRepository.find();
  }

  /**
   * Finds a blocked IP by its ID.
   * @param id Blocked IP record ID.
   * @returns The found {@link IPBlocker}.
   * @throws NotFoundException if IP does not exist.
   */
  async findOne(id: number): Promise<IPBlockerEntity> {
    this.logger.debug(`Searching blocked IP by id: ${id}`);
    const ip = await this.ipBlockerRepository.findOne({ where: { id } });
    if (!ip) {
      this.logger.warn(`Blocked IP not found (id: ${id})`);
      throw new NotFoundException("Blocked IP not found");
    }
    this.logger.debug(`Blocked IP found: ${JSON.stringify(ip)}`);
    return ip;
  }

  /**
   * Finds a blocked IP by its address.
   * @param ipAddress IP address string.
   * @returns The found {@link IPBlocker}.
   * @throws NotFoundException if IP does not exist.
   */
  async findByIP(ipAddress: string): Promise<IPBlockerEntity> {
    this.logger.debug(`Searching blocked IP by address: ${ipAddress}`);
    const ip = await this.ipBlockerRepository.findOne({ where: { ipAddress } });
    if (!ip) {
      this.logger.warn(`Blocked IP not found (address: ${ipAddress})`);
      throw new NotFoundException("Blocked IP not found");
    }
    this.logger.debug(`Blocked IP found: ${JSON.stringify(ip)}`);
    return ip;
  }

  /**
   * Creates a new blocked IP record.
   * @param data DTO for creating a blocked IP.
   * @returns The created {@link IPBlocker}.
   */
  async create(data: CreateIPBlockerDto): Promise<IPBlockerEntity> {
    this.logger.debug(`Creating blocked IP: ${JSON.stringify(data)}`);
    const ip = this.ipBlockerRepository.create({
      ...data,
      blockedAt: new Date(),
      isActive: true,
    });
    const saved = await this.ipBlockerRepository.save(ip);
    this.logger.debug(`Blocked IP created: ${JSON.stringify(saved)}`);
    return saved;
  }

  /**
   * Updates an existing blocked IP by ID.
   * @param id Blocked IP record ID.
   * @param data DTO for updating a blocked IP.
   * @returns The updated {@link IPBlocker}.
   * @throws NotFoundException if IP does not exist.
   */
  async update(id: number, data: UpdateIPBlockerDto): Promise<IPBlockerEntity> {
    this.logger.debug(`Updating blocked IP (id: ${id}) with data: ${JSON.stringify(data)}`);
    const ip = await this.findOne(id);
    Object.assign(ip, data);
    if (data.isActive === false && !ip.unblockedAt) {
      ip.unblockedAt = new Date();
      this.logger.debug(`IP unblocked (id: ${id}) at ${ip.unblockedAt}`);
    }
    const updated = await this.ipBlockerRepository.save(ip);
    this.logger.debug(`Blocked IP updated: ${JSON.stringify(updated)}`);
    return updated;
  }

  /**
   * Removes a blocked IP by ID.
   * @param id Blocked IP record ID.
   * @returns void
   * @throws NotFoundException if IP does not exist.
   */
  async remove(id: number): Promise<void> {
    this.logger.debug(`Removing blocked IP (id: ${id})`);
    const ip = await this.findOne(id);
    await this.ipBlockerRepository.remove(ip);
    this.logger.debug(`Blocked IP removed (id: ${id})`);
  }

  /**
   * Unblocks all IPs (sets isActive to false and sets unblockedAt).
   * @returns void
   */
  async unblockAll(): Promise<void> {
    this.logger.debug("Unblocking all IPs");
    const ips = await this.ipBlockerRepository.find({ where: { isActive: true } });
    for (const ip of ips) {
      ip.isActive = false;
      ip.unblockedAt = new Date();
      await this.ipBlockerRepository.save(ip);
      this.logger.debug(`IP unblocked: ${ip.ipAddress}`);
    }
    this.logger.debug("All IPs unblocked");
  }

  /**
   * Removes all blocked IP records from the database.
   * @returns void
   */
  async removeAll(): Promise<void> {
    this.logger.debug("Removing all blocked IPs");
    await this.ipBlockerRepository.clear();
    this.logger.debug("All blocked IPs removed");
  }

  /**
   * Logs blocked IPs from the last 24 hours
   * and the last 5 blocked IPs saved in the database.
   */
  @Cron(CronExpression.EVERY_HOUR, { name: "logRecentBlockedIPs", timeZone: "UTC" })
  async logRecentBlockedIPs(): Promise<void> {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Blocked IPs in the last 24 hours
    const recentIPs = await this.ipBlockerRepository.find({
      where: {
        blockedAt: MoreThanOrEqual(yesterday),
        isActive: true,
      },
      order: { blockedAt: "DESC" },
    });

    // Last 5 blocked IPs
    const lastFiveIPs = await this.ipBlockerRepository.find({
      where: { isActive: true },
      order: { blockedAt: "DESC" },
      take: 5,
    });

    if (recentIPs.length > 0) {
      this.logger.debug(`Blocked IPs in the last 24 hours:`);
      recentIPs.forEach((ip) => {
        this.logger.debug(`- ${ip.ipAddress} (blocked at: ${ip.blockedAt})`);
      });
    }

    if (lastFiveIPs.length > 0) {
      this.logger.debug(`Last 5 blocked IPs:`);
      lastFiveIPs.forEach((ip) => {
        this.logger.debug(`- ${ip.ipAddress} (blocked at: ${ip.blockedAt})`);
      });
    }
  }
}
