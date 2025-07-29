import { z } from "zod";

/**
 * Zod schema for creating a blocked IP.
 */
export const IPBlockerCreateSchema = z.object({
  ipAddress: z.string().min(7).max(45),
  reason: z.string().optional(),
});

/**
 * Zod schema for updating a blocked IP.
 */
export const IPBlockerUpdateSchema = z.object({
  reason: z.string().optional(),
  isActive: z.boolean().optional(),
});
