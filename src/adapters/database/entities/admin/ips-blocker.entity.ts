import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

import { ApiProperty } from "@nestjs/swagger";

/**
 * Entity representing a blocked IP address in the system.
 * Used for managing and controlling access restrictions based on IP.
 *
 * @remarks
 * This entity stores information about blocked IPs, including the reason,
 * block status, and timestamps for auditing and control purposes.
 */
@Entity()
export class IPBlockerEntity extends BaseEntity {
  /**
   * Unique identifier for the blocked IP record.
   */
  @ApiProperty({
    description: "Unique identifier for the blocked IP record.",
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * The IP address that is blocked.
   */
  @ApiProperty({
    description: "The IP address that is blocked.",
    example: "192.168.1.100",
  })
  @Column({ type: "varchar", length: 45 })
  ipAddress!: string;

  /**
   * Date and time when the IP was blocked.
   */
  @ApiProperty({
    description: "Date and time when the IP was blocked.",
    example: "2024-06-10T12:34:56.000Z",
  })
  @Column({ type: "timestamp" })
  blockedAt!: Date;

  /**
   * Reason for blocking the IP address.
   */
  @ApiProperty({
    description: "Reason for blocking the IP address.",
    example: "Suspicious activity detected.",
    required: false,
  })
  @Column({ type: "text", nullable: true })
  reason?: string;

  /**
   * Indicates if the block is currently active.
   */
  @ApiProperty({
    description: "Indicates if the block is currently active.",
    example: true,
  })
  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  /**
   * Date and time when the IP was unblocked, if applicable.
   */
  @ApiProperty({
    description: "Date and time when the IP was unblocked, if applicable.",
    example: "2024-06-11T15:00:00.000Z",
    required: false,
  })
  @Column({ type: "timestamp", nullable: true })
  unblockedAt?: Date;
}
