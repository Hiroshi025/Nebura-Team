import { StatusEntity } from "#entity/health/status.entity";
import { Repository } from "typeorm";

import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

/**
 * Service for managing error history and application health status.
 * Uses StatusEntity to persist and retrieve health and error information.
 *
 * @see https://docs.nestjs.com/providers
 * @see https://typeorm.io/#/repository-api
 *
 * @example
 * const status = await errorHistoryService.logError("Database connection failed");
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
   * @param statusRepository - Injected TypeORM repository for StatusEntity.
   */
  constructor(
    @InjectRepository(StatusEntity)
    private readonly statusRepository: Repository<StatusEntity>,
  ) {}

  /**
   * Logs an error by creating a new StatusEntity entry.
   *
   * @param message - The error message to log.
   * @param additionalInfo - Optional additional information about the error.
   * @returns The newly created StatusEntity.
   * @throws {HttpException} If there is an error during logging.
   *
   * @example
   * const status = await errorHistoryService.logError("API timeout", "Timeout after 30s");
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
   * @returns An array of StatusEntity representing the error history.
   * @throws {HttpException} If there is an error during retrieval.
   *
   * @example
   * const history = await errorHistoryService.getErrorHistory();
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
