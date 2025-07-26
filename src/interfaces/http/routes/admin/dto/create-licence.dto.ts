import { LicenseType } from "#entity/utils/licence.entity";
import { IsArray, IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * Data Transfer Object for creating a new licence.
 * Used in POST /admin/licence endpoint.
 *
 * @see https://docs.nestjs.com/controllers#request-payloads
 * @see https://docs.nestjs.com/techniques/validation
 *
 * @example
 * {
 *   "identifier": "LIC-UNIQUE-001",
 *   "key": "ABC123-XYZ789",
 *   "type": "premium",
 *   "userId": "user-uuid-123",
 *   "adminId": "admin-uuid-456",
 *   "hwid": ["HWID1", "HWID2"],
 *   "requestLimit": 1000,
 *   "validUntil": "2025-12-31T23:59:59Z",
 *   "ips": ["192.168.1.1", "10.0.0.2"],
 *   "maxIps": 5
 * }
 */
export class LicenceCreateDto {
  /**
   * Unique identifier for the licence, used for searching.
   * @example "LIC-UNIQUE-001"
   */
  @ApiProperty({ example: "LIC-UNIQUE-001" })
  @IsString()
  identifier!: string;

  /**
   * Licence key string.
   * @example "ABC123-XYZ789"
   */
  @ApiProperty({ example: "ABC123-XYZ789" })
  @IsString()
  key!: string;

  /**
   * Licence type (basic, premium, enterprise).
   * @example "premium"
   */
  @ApiProperty({ example: "premium", enum: LicenseType })
  @IsEnum(LicenseType)
  type!: LicenseType;

  /**
   * User ID of the licence owner.
   * @example "user-uuid-123"
   */
  @ApiProperty({ example: "user-uuid-123" })
  @IsString()
  userId!: string;

  /**
   * Admin ID who assigned the licence.
   * @example "admin-uuid-456"
   */
  @ApiProperty({ example: "admin-uuid-456" })
  @IsString()
  adminId!: string;

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
   * @default 1000
   * @example 1000
   */
  @ApiPropertyOptional({ example: 1000, default: 1000 })
  @IsInt()
  @Min(1)
  @IsOptional()
  requestLimit?: number = 1000;

  /**
   * Expiration date of the licence (ISO string).
   * @example "2025-12-31T23:59:59Z"
   */
  @ApiProperty({ example: "2025-12-31T23:59:59Z" })
  @IsDateString()
  validUntil!: string;

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
   * @default 5
   * @example 5
   */
  @ApiPropertyOptional({ example: 5, default: 5 })
  @IsInt()
  @Min(1)
  @IsOptional()
  maxIps?: number = 5;
}
