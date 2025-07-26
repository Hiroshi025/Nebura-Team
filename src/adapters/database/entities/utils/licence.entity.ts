/* eslint-disable prettier/prettier */
import { IsArray, IsDate, IsInt, IsOptional, IsString } from "class-validator";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * Enum representing the available license types.
 *
 * - BASIC: Basic license with limited features.
 * - PREMIUM: Premium license with extended features.
 * - ENTERPRISE: Enterprise license with all features.
 *
 * @example
 * ```ts
 * LicenseType.BASIC // "basic"
 * LicenseType.PREMIUM // "premium"
 * LicenseType.ENTERPRISE // "enterprise"
 * ```
 *
 * @see {@link https://www.typescriptlang.org/docs/handbook/enums.html TypeScript Enums}
 */
export enum LicenseType {
  BASIC = "basic",
  PREMIUM = "premium",
  ENTERPRISE = "enterprise",
}

/**
 * Entity representing a software license in the database.
 *
 * This entity is mapped to the database using TypeORM and includes
 * validation decorators for runtime checks and Swagger decorators for API documentation.
 *
 * @example
 * ```ts
 * const license = new LicenseEntity();
 * license.key = "ABC123-XYZ789";
 * license.type = LicenseType.PREMIUM;
 * license.userId = "user-uuid-123";
 * license.adminId = "admin-uuid-456";
 * license.hwid = ["HWID1", "HWID2"];
 * license.requestLimit = 1000;
 * license.requestCount = 10;
 * license.validUntil = new Date("2025-12-31T23:59:59Z");
 * license.ips = ["192.168.1.1", "10.0.0.2"];
 * license.maxIps = 5;
 * license.identifier = "LIC-UNIQUE-001";
 * ```
 *
 * @see {@link https://typeorm.io/entities TypeORM Entities}
 * @see {@link https://docs.nestjs.com/openapi/introduction NestJS Swagger}
 * @see {@link https://github.com/typestack/class-validator class-validator}
 */
@Entity()
export class LicenseEntity extends BaseEntity {
  /**
   * Unique license ID (UUID).
   *
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  @PrimaryGeneratedColumn("uuid")
  @ApiProperty({ description: "Unique license ID", example: "550e8400-e29b-41d4-a716-446655440000" })
  id!: string;

  /**
   * Unique license key.
   *
   * @example "ABC123-XYZ789"
   */
  @Column({ unique: true })
  @ApiProperty({ description: "Unique license key", example: "ABC123-XYZ789" })
  @IsString()
  key!: string;

  /**
   * License type.
   *
   * @example "premium"
   */
  @Column({ type: "enum", enum: LicenseType })
  @ApiProperty({ description: "License type", example: "premium", enum: LicenseType })
  type!: LicenseType;

  /**
   * Owner user ID.
   *
   * @example "user-uuid-123"
   */
  @Column()
  @ApiProperty({ description: "Owner user ID", example: "user-uuid-123" })
  @IsString()
  userId!: string;

  /**
   * Admin assigner ID.
   *
   * @example "admin-uuid-456"
   */
  @Column()
  @ApiProperty({ description: "Admin assigner ID", example: "admin-uuid-456" })
  @IsString()
  adminId!: string;

  /**
   * Associated hardware IDs (HWIDs).
   *
   * @example ["HWID1", "HWID2"]
   */
  @Column("simple-array")
  @ApiProperty({ description: "Associated HWIDs", example: ["HWID1", "HWID2"] })
  @IsArray()
  hwid!: string[];

  /**
   * Request limit for the license.
   *
   * @default 1000
   * @example 1000
   */
  @Column({ default: 1000 })
  @ApiProperty({ description: "Request limit", example: 1000 })
  @IsInt()
  requestLimit!: number;

  /**
   * Number of requests made with this license.
   *
   * @default 0
   * @example 10
   */
  @Column({ default: 0 })
  @ApiProperty({ description: "Requests made", example: 10 })
  @IsInt()
  requestCount!: number;

  /**
   * Expiration date of the license.
   *
   * @example "2025-12-31T23:59:59Z"
   */
  @Column()
  @ApiProperty({ description: "Expiration date", example: "2025-12-31T23:59:59Z" })
  @IsDate()
  validUntil!: Date;

  /**
   * Last used IP address.
   *
   * @example "192.168.1.1"
   */
  @Column({ nullable: true })
  @ApiPropertyOptional({ description: "Last used IP", example: "192.168.1.1" })
  @IsOptional()
  @IsString()
  lastUsedIp?: string;

  /**
   * Last used hardware ID.
   *
   * @example "HWID1"
   */
  @Column({ nullable: true })
  @ApiPropertyOptional({ description: "Last used HWID", example: "HWID1" })
  @IsOptional()
  @IsString()
  lastUsedHwid?: string;

  /**
   * Associated IP addresses.
   *
   * @example ["192.168.1.1", "10.0.0.2"]
   */
  @Column("simple-array", { default: "" })
  @ApiProperty({ description: "Associated IPs", example: ["192.168.1.1", "10.0.0.2"] })
  @IsArray()
  ips!: string[];

  /**
   * Maximum allowed IP addresses.
   *
   * @default 5
   * @example 5
   */
  @Column({ nullable: true, default: 5 })
  @ApiPropertyOptional({ description: "Max allowed IPs", example: 5 })
  @IsOptional()
  @IsInt()
  maxIps?: number;

  /**
   * Date when the license was created.
   *
   * @example "2024-07-25T12:00:00Z"
   */
  @CreateDateColumn()
  @ApiProperty({ description: "Creation date", example: "2024-07-25T12:00:00Z" })
  createdAt!: Date;

  /**
   * Date when the license was last updated.
   *
   * @example "2024-07-25T12:00:00Z"
   */
  @UpdateDateColumn()
  @ApiProperty({ description: "Update date", example: "2024-07-25T12:00:00Z" })
  updatedAt!: Date;

  /**
   * Unique licence identifier for search.
   *
   * @example "LIC-UNIQUE-001"
   */
  @Column({ unique: true })
  @ApiProperty({ description: "Unique licence identifier for search", example: "LIC-UNIQUE-001" })
  @IsString()
  identifier!: string;
}
