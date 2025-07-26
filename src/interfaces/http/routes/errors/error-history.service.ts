import { StatusEntity } from "#adapters/database/entities/health/status.entity";
import { Repository } from "typeorm";

import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

/**
 * Service for managing error history and application health status.
 *
 * This service provides methods to log errors and retrieve error history,
 * persisting data using the {@link StatusEntity} and TypeORM repository.
 *
 * @see {@link https://docs.nestjs.com/providers NestJS Providers}
 * @see {@link https://typeorm.io/#/repository-api TypeORM Repository API}
 *
 * @example
 * // Logging an error:
 * const status = await errorHistoryService.logError("Database connection failed");
 * // Retrieving error history:
 * const history = await errorHistoryService.getErrorHistory();
 */
@Injectable()
export class ErrorHistoryService {
  /**
   * Logger instance for logging messages related to error history operations.
   */
  private readonly logger = new Logger(ErrorHistoryService.name);

  /**
   * Creates an instance of ErrorHistoryService.
   *
   * @param statusRepository Injected TypeORM repository for {@link StatusEntity}.
   */
  constructor(
    @InjectRepository(StatusEntity)
    private readonly statusRepository: Repository<StatusEntity>,
  ) {}

  /**
   * Logs an error by creating a new {@link StatusEntity} entry in the database.
   *
   * This method creates a new error record with the current timestamp, memory usage,
   * and optional additional information. The error is persisted using TypeORM.
   *
   * @param message The error message to log.
   * @param additionalInfo Optional additional information about the error.
   * @returns The newly created {@link StatusEntity}.
   * @throws {@link HttpException} If there is an error during logging.
   *
   * @example
   * // Log an error with additional info:
   * const status = await errorHistoryService.logError("API timeout", "Timeout after 30s");
   *
   * @see {@link https://nodejs.org/api/process.html#processmemoryusage | Node.js process.memoryUsage}
   * @see {@link https://typeorm.io/#/repository-api | TypeORM Repository API}
   */
  async logError(message: string, additionalInfo?: string): Promise<StatusEntity> {
    try {
      const status = this.statusRepository.create({
        timestamp: new Date(),
        memoryUsage: process.memoryUsage().heapUsed,
        cpuUsage: 0, // You may implement CPU usage calculation as needed
        errorCount: 1,
        additionalInfo: additionalInfo ? `${message} | ${additionalInfo}` : message,
      });
      const savedStatus = await this.statusRepository.save(status);
      this.logger.log(`Error logged with ID: ${savedStatus.id}`);
      return savedStatus;
    } catch (error) {
      this.logger.error("Error logging error", error);
      throw new HttpException("Error logging error", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Retrieves the error history from the database.
   *
   * This method fetches all error records from the database, ordered by timestamp descending.
   *
   * @returns An array of {@link StatusEntity} representing the error history.
   * @throws {@link HttpException} If there is an error during retrieval.
   *
   * @example
   * // Get all error history entries:
   * const history = await errorHistoryService.getErrorHistory();
   *
   * @see {@link https://typeorm.io/#/repository-api | TypeORM Repository API}
   */
  async getErrorHistory(): Promise<StatusEntity[]> {
    try {
      const history = await this.statusRepository.find({
        order: { timestamp: "DESC" },
      });
      this.logger.log(`Retrieved ${history.length} error history entries`);
      return history;
    } catch (error) {
      this.logger.error("Error retrieving error history", error);
      throw new HttpException("Error retrieving error history", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
