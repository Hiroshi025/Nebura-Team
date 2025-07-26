import { LicenseType } from "#entity/utils/licence.entity";
import z from "zod";

/**
 * Schema for creating a new Licence.
 *
 * This schema validates the structure of a licence creation payload.
 * It ensures all required fields are present and correctly typed.
 *
 * @example
 * ```ts
 * const payload = {
 *   identifier: "LIC-12345",
 *   key: "ABCDEF123456",
 *   type: LicenseType.BASIC,
 *   userId: "user-001",
 *   adminId: "admin-001",
 *   hwid: ["HWID-001", "HWID-002"],
 *   requestLimit: 1000,
 *   validUntil: new Date("2025-01-01"),
 *   ips: ["192.168.1.1"],
 *   maxIps: 5
 * };
 * LicenceCreateSchema.parse(payload); // returns validated payload
 * ```
 *
 * @see {@link https://zod.dev/ Zod Documentation}
 */
export const LicenceCreateSchema = z.object({
  /**
   * Unique identifier for the licence.
   */
  identifier: z.string().min(1),
  /**
   * Licence key string.
   */
  key: z.string().min(1),
  /**
   * Type of licence. Must be one of BASIC, PREMIUM, or ENTERPRISE.
   */
  type: z.enum([LicenseType.BASIC, LicenseType.PREMIUM, LicenseType.ENTERPRISE]),
  /**
   * User ID associated with the licence.
   */
  userId: z.string().min(1),
  /**
   * Admin ID who created or manages the licence.
   */
  adminId: z.string().min(1),
  /**
   * List of hardware IDs (HWIDs) associated with the licence.
   * Optional, defaults to an empty array.
   */
  hwid: z.array(z.string()).optional().default([]),
  /**
   * Maximum number of requests allowed.
   * Defaults to 1000.
   */
  requestLimit: z.number().int().min(1).default(1000),
  /**
   * Expiration date of the licence.
   */
  validUntil: z.coerce.date(),
  /**
   * List of allowed IP addresses.
   * Optional, defaults to an empty array.
   */
  ips: z.array(z.string()).optional().default([]),
  /**
   * Maximum number of IP addresses allowed.
   * Optional, defaults to 5.
   */
  maxIps: z.number().int().min(1).optional().default(5),
});

/**
 * Schema for updating an existing Licence.
 *
 * This schema validates the structure of a licence update payload.
 * All fields are optional, allowing partial updates.
 *
 * @example
 * ```ts
 * const updatePayload = {
 *   requestLimit: 2000,
 *   validUntil: new Date("2026-01-01"),
 *   lastUsedIp: "192.168.1.2"
 * };
 * LicenceUpdateSchema.parse(updatePayload); // returns validated update payload
 * ```
 *
 * @see {@link https://zod.dev/ Zod Documentation}
 */
export const LicenceUpdateSchema = z.object({
  /**
   * Unique identifier for the licence.
   */
  identifier: z.string().min(1).optional(),
  /**
   * Licence key string.
   */
  key: z.string().min(1).optional(),
  /**
   * Type of licence. Must be one of BASIC, PREMIUM, or ENTERPRISE.
   */
  type: z.enum([LicenseType.BASIC, LicenseType.PREMIUM, LicenseType.ENTERPRISE]).optional(),
  /**
   * User ID associated with the licence.
   */
  userId: z.string().min(1).optional(),
  /**
   * Admin ID who created or manages the licence.
   */
  adminId: z.string().min(1).optional(),
  /**
   * List of hardware IDs (HWIDs) associated with the licence.
   */
  hwid: z.array(z.string()).optional(),
  /**
   * Maximum number of requests allowed.
   */
  requestLimit: z.number().int().min(1).optional(),
  /**
   * Current request count.
   */
  requestCount: z.number().int().min(0).optional(),
  /**
   * Expiration date of the licence.
   */
  validUntil: z.coerce.date().optional(),
  /**
   * Last used IP address.
   */
  lastUsedIp: z.string().optional(),
  /**
   * Last used hardware ID.
   */
  lastUsedHwid: z.string().optional(),
  /**
   * List of allowed IP addresses.
   */
  ips: z.array(z.string()).optional(),
  /**
   * Maximum number of IP addresses allowed.
   */
  maxIps: z.number().int().min(1).optional(),
});

/**
 * Type representing the validated payload for creating a licence.
 *
 * @see {@link LicenceCreateSchema}
 */
export type LicenceCreateType = z.infer<typeof LicenceCreateSchema>;

/**
 * Type representing the validated payload for updating a licence.
 *
 * @see {@link LicenceUpdateSchema}
 */
export type LicenceUpdateType = z.infer<typeof LicenceUpdateSchema>;
