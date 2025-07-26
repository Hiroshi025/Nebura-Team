import { LicenseType } from "#entity/utils/licence.entity";
import { IsArray, IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

import { ApiPropertyOptional } from "@nestjs/swagger";

/**
 * Data Transfer Object for updating an existing licence.
 * Used in PUT /admin/licence/:id endpoint.
 *
 * All fields are optional for partial updates.
 *
 * @see https://docs.nestjs.com/controllers#request-payloads
 * @see https://docs.nestjs.com/techniques/validation
 *
 * @example
 * {
 *   "identifier": "LIC-UNIQUE-001",
 *   "type": "enterprise",
 *   "requestLimit": 5000
 * }
 */
export class LicenceUpdateDto {
  /**
   * Unique identifier for the licence, used for searching.
   * @example "LIC-UNIQUE-001"
   */
  @ApiPropertyOptional({ example: "LIC-UNIQUE-001" })
  @IsString()
  @IsOptional()
  identifier?: string;

  /**
   * Licence key string.
   * @example "ABC123-XYZ789"
   */
  @ApiPropertyOptional({ example: "ABC123-XYZ789" })
  @IsString()
  @IsOptional()
  key?: string;

  /**
   * Licence type (basic, premium, enterprise).
   * @example "premium"
   */
  @ApiPropertyOptional({ example: "premium", enum: LicenseType })
  @IsEnum(LicenseType)
  @IsOptional()
  type?: LicenseType;

  /**
   * User ID of the licence owner.
   * @example "user-uuid-123"
   */
  @ApiPropertyOptional({ example: "user-uuid-123" })
  @IsString()
  @IsOptional()
  userId?: string;

  /**
   * Admin ID who assigned the licence.
   * @example "admin-uuid-456"
   */
  @ApiPropertyOptional({ example: "admin-uuid-456" })
  @IsString()
  @IsOptional()
  adminId?: string;

  /**
   * Array of associated HWIDs.
   * @example ["HWID1", "HWID2"]
   */
  @ApiPropertyOptional({ example: ["HWID1", "HWID2"] })
  @IsArray()
  @IsOptional()
  hwid?: string[];

  /**
   * Maximum allowed requests for the licence.
   * @example 1000
   */
  @ApiPropertyOptional({ example: 1000 })
  @IsInt()
  @Min(1)
  @IsOptional()
  requestLimit?: number;

  /**
   * Number of requests made.
   * @example 10
   */
  @ApiPropertyOptional({ example: 10 })
  @IsInt()
  @Min(0)
  @IsOptional()
  requestCount?: number;

  /**
   * Expiration date of the licence (ISO string).
   * @example "2025-12-31T23:59:59Z"
   */
  @ApiPropertyOptional({ example: "2025-12-31T23:59:59Z" })
  @IsDateString()
  @IsOptional()
  validUntil?: string;

  /**
   * Last used IP address.
   * @example "192.168.1.1"
   */
  @ApiPropertyOptional({ example: "192.168.1.1" })
  @IsString()
  @IsOptional()
  lastUsedIp?: string;

  /**
   * Last used HWID.
   * @example "HWID1"
   */
  @ApiPropertyOptional({ example: "HWID1" })
  @IsString()
  @IsOptional()
  lastUsedHwid?: string;

  /**
   * Array of associated IP addresses.
   * @example ["192.168.1.1", "10.0.0.2"]
   */
  @ApiPropertyOptional({ example: ["192.168.1.1", "10.0.0.2"] })
  @IsArray()
  @IsOptional()
  ips?: string[];

  /**
   * Maximum allowed IPs for the licence.
   * @example 5
   */
  @ApiPropertyOptional({ example: 5 })
  @IsInt()
  @Min(1)
  @IsOptional()
  maxIps?: number;
}
