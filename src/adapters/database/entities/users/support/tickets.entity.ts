import { IsArray, IsDate, IsEnum, IsOptional, IsString, IsUUID, Length } from "class-validator";
import {
	BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * Ticket status values.
 * @see https://en.wikipedia.org/wiki/Issue_tracking_system
 */
export type TicketStatus = "open" | "in_progress" | "waiting_user" | "closed";

/**
 * Ticket priority values.
 */
export type TicketPriority = "low" | "medium" | "high" | "critical";

/**
 * Represents a support ticket created by a user.
 *
 * This entity is mapped to the database and includes all relevant information for user support tickets.
 *
 * @example
 * const ticket = new TicketEntity();
 * ticket.userId = "550e8400-e29b-41d4-a716-446655440000";
 * ticket.title = "API not responding";
 * ticket.description = "The API endpoint /v1/data is not returning data.";
 * ticket.status = "open";
 * ticket.priority = "high";
 * await ticket.save();
 *
 * @see https://typeorm.io/#/entities
 */
@Entity()
export class TicketEntity extends BaseEntity {
  /**
   * Unique identifier for the ticket (UUID).
   * @example "c1a2b3c4-d5e6-7890-abcd-ef1234567890"
   */
  @PrimaryGeneratedColumn("uuid")
  @ApiProperty({
    description: "Unique identifier for the ticket (UUID)",
    example: "c1a2b3c4-d5e6-7890-abcd-ef1234567890",
    type: "string",
  })
  @IsString()
  id!: string;

  /**
   * UUID of the ticket.
   * @example "c1a2b3c4-d5e6-7890-abcd-ef1234567890"
   */
  @Column({ type: "uuid", unique: true, default: () => "gen_random_uuid()" })
  @ApiProperty({
    description: "UUID of the ticket",
    example: "c1a2b3c4-d5e6-7890-abcd-ef1234567890",
    type: "string",
  })
  uuid!: string;

  /**
   * UUID of the user who created the ticket.
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  @Column()
  @ApiProperty({
    description: "UUID of the user who created the ticket",
    example: "550e8400-e29b-41d4-a716-446655440000",
    type: "string",
  })
  @IsUUID()
  userId!: string;

  /**
   * Title of the ticket.
   * @example "API not responding"
   */
  @Column()
  @ApiProperty({
    description: "Title of the ticket",
    example: "API not responding",
    type: "string",
    maxLength: 80,
  })
  @IsString()
  @Length(4, 80)
  title!: string;

  /**
   * Detailed description of the issue or request.
   * @example "The API endpoint /v1/data is not returning data."
   */
  @Column()
  @ApiProperty({
    description: "Detailed description of the issue or request",
    example: "The API endpoint /v1/data is not returning data.",
    type: "string",
  })
  @IsString()
  @Length(10, 1000)
  description!: string;

  /**
   * Current status of the ticket.
   * Allowed values: "open", "in_progress", "waiting_user", "closed".
   * @default "open"
   * @see https://en.wikipedia.org/wiki/Issue_tracking_system
   */
  @Column({ type: "varchar", default: "open" })
  @ApiProperty({
    description: "Current status of the ticket",
    example: "open",
    enum: ["open", "in_progress", "waiting_user", "closed"],
    default: "open",
  })
  @IsEnum(["open", "in_progress", "waiting_user", "closed"])
  status!: TicketStatus;

  /**
   * Priority of the ticket.
   * Allowed values: "low", "medium", "high", "critical".
   * @default "low"
   */
  @Column({ type: "varchar", default: "low" })
  @ApiProperty({
    description: "Priority of the ticket",
    example: "high",
    enum: ["low", "medium", "high", "critical"],
    default: "low",
  })
  @IsEnum(["low", "medium", "high", "critical"])
  priority!: TicketPriority;

  /**
   * Category of the ticket (e.g., Technical Support, Billing, Suggestions, Security).
   * @example "Technical Support"
   */
  @Column({ type: "varchar", nullable: true })
  @ApiPropertyOptional({
    description: "Category of the ticket (e.g., Technical Support, Billing, Suggestions, Security)",
    example: "Technical Support",
    type: "string",
  })
  @IsOptional()
  @IsString()
  category?: string;

  /**
   * Array of attached links relevant to the ticket.
   * @example ["https://example.com/logs/123", "https://imgur.com/abc"]
   */
  @Column("simple-array", { nullable: true })
  @ApiPropertyOptional({
    description: "Array of attached links relevant to the ticket",
    example: ["https://example.com/logs/123", "https://imgur.com/abc"],
    type: "array",
    items: { type: "string" },
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  links?: string[];

  /**
   * Array of file attachment URLs (images, logs, PDFs, etc.).
   * @example ["https://cdn.example.com/file1.png", "https://cdn.example.com/file2.pdf"]
   */
  @Column("simple-array", { nullable: true })
  @ApiPropertyOptional({
    description: "Array of file attachment URLs (images, logs, PDFs, etc.)",
    example: ["https://cdn.example.com/file1.png", "https://cdn.example.com/file2.pdf"],
    type: "array",
    items: { type: "string" },
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  /**
   * Additional fields for custom ticket data (e.g., flags, metadata).
   * @example { urgent: true, evidence: true }
   */
  @Column("jsonb", { nullable: true })
  @ApiPropertyOptional({
    description: "Additional fields for custom ticket data (e.g., flags, metadata)",
    example: { urgent: true, evidence: true },
    type: "object",
    additionalProperties: true,
  })
  @IsOptional()
  fields?: Record<string, any>;

  /**
   * Timestamp when the ticket was created.
   * @example "2024-06-10T12:00:00Z"
   */
  @CreateDateColumn()
  @ApiProperty({
    description: "Timestamp when the ticket was created",
    example: "2024-06-10T12:00:00Z",
    type: "string",
    format: "date-time",
  })
  @IsDate()
  createdAt!: Date;

  /**
   * Timestamp when the ticket was last updated.
   * @example "2024-06-10T13:00:00Z"
   */
  @UpdateDateColumn()
  @ApiProperty({
    description: "Timestamp when the ticket was last updated",
    example: "2024-06-10T13:00:00Z",
    type: "string",
    format: "date-time",
  })
  @IsDate()
  updatedAt!: Date;

  /**
   * Array of messages or comments associated with the ticket.
   * Each message can include a user ID, content, and timestamp.
   * @example [{ userId: "550e8400-e29b-41d4-a716-446655440000", content: "I have the same issue.", timestamp: "2024-06-10T12:30:00Z" }]
   */
  @Column("jsonb", { nullable: true })
  @ApiPropertyOptional({
    description: "Array of messages or comments associated with the ticket",
    example: [{ userId: "550e8400-e29b-41d4-a716-446655440000", content: "I have the same issue.", timestamp: "2024-06-10T12:30:00Z" }],
    type: "array",
    items: {
      type: "object",
      properties: {
        userId: { type: "string", format: "uuid" },
        content: { type: "string" },
        timestamp: { type: "string", format: "date-time" },
      },
    },
  })
  messages?: Record<string, any>[]; // This field is not persisted in the database, but can be used in application logic
  
  /**
   * Array of tags for advanced classification.
   * @example ["API", "Urgent", "Frontend"]
   */
  @Column("simple-array", { nullable: true })
  @ApiPropertyOptional({
    description: "Tags for advanced classification",
    example: ["API", "Urgent", "Frontend"],
    type: "array",
    items: { type: "string" },
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  /**
   * UUID of the agent or team assigned to the ticket.
   * @example "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
   */
  @Column({ type: "varchar", nullable: true })
  @ApiPropertyOptional({
    description: "UUID of the agent or team assigned",
    example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    type: "string",
  })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  /**
   * Change history for the ticket.
   * Each record can include action type, user, date, and details.
   * @example [{ action: "status_change", userId: "...", timestamp: "...", details: { from: "open", to: "closed" } }]
   */
  @Column("jsonb", { nullable: true })
  @ApiPropertyOptional({
    description: "Change history for the ticket",
    example: [
      { action: "status_change", userId: "550e8400-e29b-41d4-a716-446655440000", timestamp: "2024-06-10T13:00:00Z", details: { from: "open", to: "closed" } }
    ],
    type: "array",
    items: {
      type: "object",
      properties: {
        action: { type: "string" },
        userId: { type: "string", format: "uuid" },
        timestamp: { type: "string", format: "date-time" },
        details: { type: "object" }
      }
    }
  })
  @IsOptional()
  @IsArray()
  history?: Record<string, any>[];

  /**
   * Custom status for the ticket (if workflow requires).
   * @example "pending_approval"
   */
  @Column({ type: "varchar", nullable: true })
  @ApiPropertyOptional({
    description: "Custom status for the ticket",
    example: "pending_approval",
    type: "string",
  })
  @IsOptional()
  @IsString()
  customStatus?: string;
}
