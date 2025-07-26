import z from "zod";

/**
 * Zod schema for validating uploaded file data.
 *
 * This schema ensures that the file metadata meets the required format before being processed or stored.
 * It is used for validating file uploads and updates in the application.
 *
 * @example
 * ```typescript
 * FileUploadSchema.parse({
 *   name: "example.txt",
 *   path: "/uploads/example.txt",
 *   mimeType: "text/plain",
 *   size: "1024",
 *   checksum: "d41d8cd98f00b204e9800998ecf8427e"
 * });
 * ```
 *
 * @see {@link https://github.com/colinhacks/zod Zod Documentation}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types MIME Types}
 */
export const FileUploadSchema = z.object({
  /**
   * The name of the file.
   * @example "example.txt"
   */
  name: z.string().min(1).max(255),
  /**
   * The storage path of the file.
   * @example "/uploads/example.txt"
   */
  path: z.string().min(1),
  /**
   * The MIME type of the file.
   * @example "text/plain"
   */
  mimeType: z.string().min(1),
  /**
   * The size of the file in bytes, as a string.
   * @example "1024"
   */
  size: z.string().regex(/^\d+$/, "Size must be a string representing a number"),
  /**
   * The checksum for file integrity.
   * @example "d41d8cd98f00b204e9800998ecf8427e"
   */
  checksum: z.string().min(1).max(255),
});

/**
 * TypeScript type for validated file data.
 *
 * @see {@link FileUploadSchema}
 * @example
 * ```typescript
 * const file: FileUploadSchemaType = {
 *   name: "example.txt",
 *   path: "/uploads/example.txt",
 *   mimeType: "text/plain",
 *   size: "1024",
 *   checksum: "d41d8cd98f00b204e9800998ecf8427e"
 * };
 * ```
 */
export type FileUploadSchemaType = z.infer<typeof FileUploadSchema>;
