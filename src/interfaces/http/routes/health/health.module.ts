import { StatusEntity } from "#adapters/database/entities/health/status.entity";

import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { TypeOrmModule } from "@nestjs/typeorm";

import { HealthController } from "./controllers/health.controller";
import { HealthService } from "./service/health.service";

/**
 * Health module for application health checks.
 *
 * This module integrates the {@link TerminusModule} to provide health check endpoints,
 * exposing the {@link HealthController} for monitoring memory, database, and other system health indicators.
 *
 * @see {@link https://docs.nestjs.com/recipes/terminus NestJS Terminus}
 * @see {@link https://docs.nestjs.com/modules NestJS Modules}
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([StatusEntity]),
    /**
     * Configures TerminusModule with logging enabled.
     * @see {@link https://docs.nestjs.com/recipes/terminus#configuration Terminus Configuration}
     */
    TerminusModule.forRoot({
      logger: true,
    }),
  ],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
