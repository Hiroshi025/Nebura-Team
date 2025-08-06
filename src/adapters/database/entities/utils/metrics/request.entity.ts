import { IsDate, IsNumber, IsString, Min } from "class-validator";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

import { ApiProperty } from "@nestjs/swagger";

/**
 * Entity to record request statistics by endpoint, clientId, and system.
 *
 * This entity is used to store metrics for each API request, including latency, error count,
 * and request count, grouped by a composite identifier.
 *
 * @example
 * // Creating a new request stat
 * const stat = new RequestStatEntity();
 * stat.identifier = "/api/v1/data-12345-Mozilla/5.0";
 * stat.endpoint = "/api/v1/data";
 * stat.clientId = "12345";
 * stat.system = "Mozilla/5.0";
 * stat.requests = 1;
 * stat.errors = 0;
 * stat.latency = 123.45;
 * await stat.save();
 *
 * @see {@link https://docs.nestjs.com/openapi/introduction NestJS Swagger}
 * @see {@link https://typeorm.io/#/entities TypeORM Entities}
 */
@Entity()
export class RequestStatEntity extends BaseEntity {
  /**
   * Unique ID for the request stat record.
   */
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: "Unique ID", example: 1 })
  @IsNumber()
  id!: number;

  /**
   * Composite identifier combining endpoint, clientId, and system.
   * Used for grouping request statistics.
   */
  @Column()
  @Min(5)
  @ApiProperty({ description: "Composite identifier endpoint-clientId-system", example: "/api/v1/data-12345-Mozilla/5.0" })
  @IsString()
  identifier!: string;

  /**
   * The requested API endpoint.
   */
  @Column()
  @Min(1)
  @ApiProperty({ description: "Requested endpoint", example: "/api/v1/data" })
  @IsString()
  endpoint!: string;

  /**
   * The client ID associated with the request.
   */
  @Column({ nullable: true })
  @ApiProperty({ description: "Client ID", example: "12345", nullable: true })
  clientId!: string;

  /**
   * The system's User-Agent string.
   */
  @Column()
  @Min(5)
  @ApiProperty({ description: "System User-Agent", example: "Mozilla/5.0" })
  @IsString()
  system!: string;

  /**
   * Number of requests for this identifier.
   */
  @Column({ default: 1 })
  @ApiProperty({ description: "Number of requests", example: 1 })
  @IsNumber()
  requests!: number;

  /**
   * Number of errors for this identifier.
   */
  @Column({ default: 0 })
  @ApiProperty({ description: "Number of errors", example: 0 })
  @IsNumber()
  errors!: number;

  /**
   * Latency of the request in milliseconds.
   */
  @Column("float")
  @ApiProperty({ description: "Latency in milliseconds", example: 123.45 })
  @IsNumber()
  latency!: number;

  /**
   * Timestamp when the request stat was created.
   */
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  @ApiProperty({ description: "Timestamp of the request", example: "2024-06-09T12:34:56.789Z" })
  @IsDate()
  createdAt!: Date;
}
