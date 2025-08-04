import { IntegerOption, StringOption } from "necord";

/**
 * Data Transfer Object for creating a notification via Discord interactions.
 *
 * This DTO is used to define the structure and validation of notification commands.
 * It supports specifying the message, type, and expiration period for the notification.
 *
 * @example
 * // Usage in a Discord command handler
 * async handleNotification(@InteractionDto() dto: NotificationDto) {
 *   // dto.message, dto.type, dto.expiresInDays
 * }
 *
 * @see {@link https://necord.dev/ Necord Documentation}
 */
export class NotificationDto {
  /**
   * Notification message to show on the dashboard.
   *
   * @example
   * dto.message = "System update scheduled for tomorrow."
   */
  @StringOption({
    name: "message",
    description: "Notification message to show on the dashboard",
    required: true,
  })
  message!: string;

  /**
   * Type of notification (info, success, warning, error).
   * Defaults to 'info' if not provided.
   *
   * @example
   * dto.type = "success"
   */
  @StringOption({
    name: "type",
    description: "Notification type (info, success, warning, error)",
    required: true,
    choices: [
      { name: "Info", value: "info" },
      { name: "Success", value: "success" },
      { name: "Warning", value: "warning" },
      { name: "Error", value: "error" },
    ],
  })
  type?: string;

  /**
   * Number of days until the notification expires.
   *
   * @example
   * dto.expiresInDays = 3
   */
  @IntegerOption({
    name: "expiresindays",
    description: "days until the notification expires (optional)",
    required: true,
  })
  expiresInDays?: number;
}

/**
 * Data Transfer Object for deleting a notification via Discord interactions.
 *
 * This DTO is used to specify the notification ID to delete.
 *
 * @example
 * // Usage in a Discord command handler
 * async handleDeleteNotification(@InteractionDto() dto: DeleteNotificationDto) {
 *   // dto.id
 * }
 *
 * @see {@link https://necord.dev/ Necord Documentation}
 */
export class DeleteNotificationDto {
  /**
   * Notification ID to delete.
   *
   * @example
   * dto.id = 42
   */
  @IntegerOption({
    name: "id",
    description: "Notification ID to delete",
    required: true,
  })
  id!: number;
}
