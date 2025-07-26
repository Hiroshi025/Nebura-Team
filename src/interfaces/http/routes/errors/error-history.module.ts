import { StatusEntity } from "#adapters/database/entities/health/status.entity";

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ErrorHistoryController } from "./controllers/error-history.controller";
import { ErrorHistoryService } from "./error-history.service";

/**
 * Module that encapsulates error history functionality.
 *
 * This module provides the {@link ErrorHistoryController} and {@link ErrorHistoryService}
 * for managing and retrieving error history records.
 *
 * @example
 * // Importing ErrorHistoryModule in your root or feature module:
 * import { ErrorHistoryModule } from './routes/errors/error-history.module';
 *
 * @Module({
 *   imports: [ErrorHistoryModule],
 * })
 * export class AppModule {}
 *
 * @see {@link https://docs.nestjs.com/modules NestJS Modules}
 * @see {@link ErrorHistoryController}
 * @see {@link ErrorHistoryService}
 */
@Module({
  imports: [TypeOrmModule.forFeature([StatusEntity])], // No additional modules are imported in this module.
  controllers: [ErrorHistoryController],
  providers: [ErrorHistoryService],
})
export class ErrorHistoryModule {}
