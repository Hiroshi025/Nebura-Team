import { IsOptional, IsString } from "class-validator";

/**
 * Data Transfer Object for updating file metadata.
 *
 * This DTO is used to validate and transfer data when updating file information via Multer.
 * All fields are optional, allowing partial updates.
 *
 * @example
 * ```typescript
 * const updateDto = new UpdateMulterDto();
 * updateDto.name = "newfile.pdf";
 * updateDto.mimeType = "application/pdf";
 * ```
 *
 * @see {@link https://docs.nestjs.com/techniques/validation NestJS Validation}
 * @see {@link https://github.com/typestack/class-validator class-validator}
 */
export class UpdateMulterDto {
  /**
   * New name for the file (optional).
   *
   * @type {string}
   * @example "updated.txt"
   */
  @IsOptional()
  @IsString()
  name?: string;

  /**
   * New MIME type for the file (optional).
   *
   * @type {string}
   * @example "image/png"
   */
  @IsOptional()
  @IsString()
  mimeType?: string;

  /**
   * New path for the file (optional).
   *
   * @type {string}
   * @example "/uploads/updated.txt"
   */
  @IsOptional()
  @IsString()
  path?: string;

  /**
   * New size for the file in bytes (optional).
   *
   * @type {string}
   * @example "2048"
   */
  @IsOptional()
  @IsString()
  size?: string;

  /**
   * New checksum for the file (optional).
   *
   * @type {string}
   * @example "e99a18c428cb38d5f260853678922e03"
   */
  @IsOptional()
  @IsString()
  checksum?: string;
}
