import { IsDate, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

import { ApiProperty } from "@nestjs/swagger";

/**
 * Entity representing a notification in the system.
 *
 * Stores the message, type, expiration date, and creation timestamp for each notification.
 * Used for displaying notifications to users and managing their lifecycle.
 *
 * @example
 * // Creating a new notification
 * const notification = new NotificationEntity();
 * notification.message = "System maintenance scheduled.";
 * notification.type = "info";
 * notification.expiresAt = new Date("2024-07-01");
 * await notification.save();
 *
 * @see {@link https://docs.nestjs.com/openapi/introduction NestJS Swagger}
 * @see {@link https://typeorm.io/#/entities TypeORM Entities}
 */
@Entity("notifications")
export class NotificationEntity extends BaseEntity {
  /**
   * Unique identifier for the notification.
   */
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: "Unique identifier for the notification" })
  @IsNumber()
  id!: number;

  /**
   * Message content of the notification.
   */
  @Column()
  @Min(5)
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: "Message content of the notification", example: "New message received" })
  message!: string;

  /**
   * Type of the notification (e.g., info, warning, error).
   */
  @Column({ default: "info" })
  @Min(3)
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: "Type of the notification (e.g., info, warning, error)", example: "info" })
  type!: string;

  /**
   * Optional expiration date for the notification.
   */
  @Column()
  @IsDate()
  @ApiProperty({ description: "Optional expiration date for the notification", example: new Date() })
  expiresAt!: Date;

  /**
   * Timestamp when the notification was created.
   */
  @CreateDateColumn()
  @IsDate()
  @ApiProperty({ description: "Timestamp when the notification was created", example: new Date() })
  createdAt!: Date;
}
