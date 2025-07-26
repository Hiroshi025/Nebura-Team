import { IsDate, IsNumber, IsString } from "class-validator";
import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * Represents the health status of the application.
 *
 * This entity is used to store and retrieve the health metrics of the application,
 * including error history, memory usage, CPU usage, and other relevant data.
 */
@Entity()
export class StatusEntity {
  /**
   * Unique identifier for the status entry.
   */
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: "Unique identifier for the status entry",
    type: Number,
  })
  id!: number;

  /**
   * Timestamp of the status check.
   */
  @Column()
  @ApiProperty({
    description: "Timestamp of the status check",
    type: Date,
  })
  @IsDate()
  timestamp!: Date;

  /**
   * Memory usage in bytes.
   */
  @Column()
  @ApiProperty({
    description: "Memory usage in bytes",
    type: Number,
  })
  @IsNumber()
  memoryUsage!: number;

  /**
   * CPU usage percentage.
   */
  @Column()
  @ApiProperty({
    description: "CPU usage percentage",
    type: Number,
  })
  @IsNumber()
  cpuUsage!: number;

  /**
   * Number of active errors recorded.
   */
  @Column()
  @ApiProperty({
    description: "Number of active errors recorded",
    type: Number,
  })
  @IsNumber()
  errorCount!: number;

  /**
   * Additional information about the health status.
   */
  @Column({ nullable: true })
  @ApiPropertyOptional({
    description: "Additional information about the health status",
    type: String,
    required: false,
  })
  @IsString()
  additionalInfo?: string;

  @DeleteDateColumn()
  @ApiProperty({
    description: "Timestamp when the status entry was deleted",
    type: Date,
    required: false,
  })
  @IsDate()
  deletedAt!: Date;
}
