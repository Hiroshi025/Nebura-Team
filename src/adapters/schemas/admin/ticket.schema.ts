/**
 * Represents the payload required to create a new support ticket.
 *
 * @property title - The title of the ticket.
 * @property description - Detailed description of the issue or request.
 * @property category - The category of the ticket (e.g., "billing", "technical").
 * @property priority - The priority level ("low", "medium", "high").
 * @property links - Array of related links or references.
 * @property attachments - Array of attachment URLs or file identifiers.
 * @property fields - Additional custom fields as key-value pairs.
 *
 * @example
 * const ticket: TicketCreate = {
 *   title: "API not working",
 *   description: "The endpoint /v1/data returns 500.",
 *   category: "technical",
 *   priority: "high",
 *   links: ["https://docs.example.com/api"],
 *   attachments: ["error.png"],
 *   fields: { environment: "production" }
 * };
 */
export type TicketCreate = {
  title: string;
  description: string;
  category: string;
  priority: string;
  links: string[];
  attachments: string[];
  fields: Record<string, any>;
};

/**
 * Represents the filters available for searching tickets.
 *
 * @property userId - The user ID associated with the ticket.
 * @property assignedTo - The user ID of the assignee.
 * @property tags - Array of tags for filtering.
 * @property category - Ticket category.
 * @property keywords - Keywords to search in title or description.
 * @property dateFrom - Start date for filtering (ISO string).
 * @property dateTo - End date for filtering (ISO string).
 * @property attachmentTypes - Array of attachment file extensions (e.g., ["pdf", "png"]).
 * @property status - Ticket status (e.g., "open", "closed").
 * @property customStatus - Custom status value.
 *
 * @example
 * const filters: TicketSearch = {
 *   userId: "user-uuid",
 *   assignedTo: "admin-uuid",
 *   tags: ["urgent", "api"],
 *   category: "technical",
 *   keywords: "error",
 *   dateFrom: "2024-06-01",
 *   dateTo: "2024-06-10",
 *   attachmentTypes: ["pdf"],
 *   status: "open",
 *   customStatus: "investigating"
 * };
 *
 * @see {@link https://docs.nestjs.com/controllers NestJS Controllers Documentation}
 */
export type TicketSearch = {
  userId: string;
  assignedTo: string;
  tags: string[];
  category: string;
  keywords: string;
  dateFrom: string;
  dateTo: string;
  attachmentTypes: string[]; // e.g. ["pdf", "png"]
  status: string;
  customStatus: string;
};

/**
 * Represents the payload for editing a ticket.
 *
 * @property ticketUuid - The UUID of the ticket to edit.
 * @property title - Updated title.
 * @property description - Updated description.
 * @property status - Updated status.
 * @property priority - Updated priority.
 * @property category - Updated category.
 * @property links - Updated links.
 * @property attachments - Updated attachments.
 * @property fields - Updated custom fields.
 * @property tags - Updated tags.
 * @property assignedTo - Updated assignee.
 * @property customStatus - Updated custom status.
 * @property userId - The user making the change (for history tracking).
 *
 * @example
 * const edit: TicketEdit = {
 *   ticketUuid: "ticket-uuid",
 *   title: "API error resolved",
 *   description: "Issue fixed in deployment.",
 *   status: "closed",
 *   priority: "medium",
 *   category: "technical",
 *   links: [],
 *   attachments: [],
 *   fields: {},
 *   tags: ["resolved"],
 *   assignedTo: "admin-uuid",
 *   customStatus: "completed",
 *   userId: "admin-uuid"
 * };
 */
export type TicketEdit = {
  ticketUuid: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  links: string[];
  attachments: string[];
  fields: Record<string, any>;
  tags: string[];
  assignedTo: string;
  customStatus: string;
  userId: string; // The user making the change (for history)
};

/**
 * Represents the filters for exporting tickets.
 *
 * @property userId - Filter by user ID.
 * @property assignedTo - Filter by assignee.
 * @property uuid - Filter by ticket UUID.
 * @property tags - Filter by tags.
 * @property category - Filter by category.
 * @property keywords - Filter by keywords.
 * @property dateFrom - Filter by start date.
 * @property dateTo - Filter by end date.
 * @property status - Filter by status.
 * @property customStatus - Filter by custom status.
 *
 * @example
 * const exportFilters: TicketExportFilters = {
 *   userId: "user-uuid",
 *   assignedTo: "admin-uuid",
 *   uuid: "ticket-uuid",
 *   tags: ["api"],
 *   category: "technical",
 *   keywords: "error",
 *   dateFrom: "2024-06-01",
 *   dateTo: "2024-06-10",
 *   status: "open",
 *   customStatus: "pending"
 * };
 */
export type TicketExportFilters = {
  userId: string;
  assignedTo: string;
  uuid: string;
  tags: string[];
  category: string;
  keywords: string;
  dateFrom: string;
  dateTo: string;
  status: string;
  customStatus: string;
};
