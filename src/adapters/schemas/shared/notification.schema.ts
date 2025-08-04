import z from "zod";

/**
 * Zod schema for validating notification objects.
 *
 * This schema ensures that a notification contains a non-empty message,
 * a type string, and an expiration date.
 *
 * @example
 * import { isValidNotification } from './notification.schema';
 *
 * const result = isValidNotification.safeParse({
 *   message: "System maintenance scheduled.",
 *   type: "info",
 *   expiresAt: new Date("2024-07-01"),
 * });
 * if (result.success) {
 *   // Valid notification object
 * }
 *
 * @see {@link https://zod.dev/ Zod Documentation}
 */
export const isValidNotification = z.object({
  message: z.string().min(1, "Message is required"),
  type: z.string(),
  expiresAt: z.date(),
});

/**
 * Type representing a valid notification object as inferred from the schema.
 *
 * @example
 * const notification: ValidNotification = {
 *   message: "Update available",
 *   type: "success",
 *   expiresAt: new Date(),
 * };
 */
export type ValidNotification = z.infer<typeof isValidNotification>;
