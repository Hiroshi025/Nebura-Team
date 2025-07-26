import { IsString } from "class-validator";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

import { ApiProperty } from "@nestjs/swagger";

/**
 * Represents a file stored in the system.
 *
 * This entity contains metadata about a file, such as its name, path, MIME type, size, checksum, and creation date.
 * It is used for file management and tracking within the application.
 *
 * @example
 * ```typescript
 * const file = new FileEntity();
 * file.name = "report.pdf";
 * file.path = "/uploads/report.pdf";
 * file.mimeType = "application/pdf";
 * file.size = "2048";
 * file.checksum = "e99a18c428cb38d5f260853678922e03";
 * ```
 *
 * @see {@link https://typeorm.io/#/entities TypeORM Entities}
 * @see {@link https://docs.nestjs.com/openapi/types-and-parameters NestJS Swagger}
 */
@Entity()
export class FileEntity extends BaseEntity {
  /**
   * Unique identifier for the file.
   *
   * @type {number}
   * @example 1
   * @see {@link https://typeorm.io/#/entities/primary-columns TypeORM Primary Columns}
   */
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: "Unique identifier for the file",
    example: 1,
    type: "integer",
  })
  id!: number;

  /**
   * Name of the file.
   *
   * @type {string}
   * @example "example.txt"
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/File/name File Name}
   */
  @Column()
  @IsString()
  @ApiProperty({
    description: "Name of the file",
    example: "example.txt",
    type: "string",
  })
  name!: string;

  /**
   * Path to the file in the storage system.
   *
   * @type {string}
   * @example "/uploads/example.txt"
   * @see {@link https://nodejs.org/api/path.html Node.js Path}
   */
  @Column()
  @IsString()
  @ApiProperty({
    description: "Path to the file",
    example: "/uploads/example.txt",
    type: "string",
  })
  path!: string;

  /**
   * MIME type of the file (optional).
   *
   * @type {string}
   * @example "text/plain"
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types MIME Types}
   */
  @Column({ nullable: true })
  @IsString()
  @ApiProperty({
    description: "MIME type of the file",
    example: "text/plain",
    type: "string",
  })
  mimeType!: string;

  /**
   * Size of the file in bytes (optional).
   *
   * @type {string}
   * @example "1024"
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/File/size File Size}
   */
  @Column({ nullable: true })
  @IsString()
  @ApiProperty({
    description: "Size of the file in bytes",
    example: "1024",
    type: "string",
  })
  size!: string;

  /**
   * Checksum of the file for integrity verification (optional).
   *
   * @type {string}
   * @example "d41d8cd98f00b204e9800998ecf8427e"
   * @see {@link https://en.wikipedia.org/wiki/Checksum Checksum}
   */
  @Column({ nullable: true })
  @IsString()
  @ApiProperty({
    description: "Checksum of the file",
    example: "d41d8cd98f00b204e9800998ecf8427e",
    type: "string",
  })
  checksum!: string;

  /**
   * User UUID associated with the file.
   *
   * This field is used to associate the file with a specific user in the system.
   *
   * @type {string}
   * @example "550e8400-e29b-41d4-a716-446655440000"
   * @see {@link https://docs.nestjs.com/security/authentication NestJS Authentication}
   */
  @Column({ nullable: true })
  @IsString()
  @ApiProperty({
    description: "User UUID associated with the file",
    example: "550e8400-e29b-41d4-a716-446655440000",
    type: "string",
  })
  userUuid!: string;
  /**
   * Date and time when the file was created.
   *
   * @type {Date}
   * @example "2023-10-01T12:00:00Z"
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date JavaScript Date}
   */
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  @ApiProperty({
    description: "Date and time when the file was created",
    example: "2023-10-01T12:00:00Z",
    type: "string",
    format: "date-time",
  })
  deleteAt!: Date;
}
