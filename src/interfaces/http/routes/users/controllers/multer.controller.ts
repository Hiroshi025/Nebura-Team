/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { UuidSchema } from "#adapters/schemas/shared/uuid.schema";
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { AuthGuard } from "#common/guards/auth.guard";

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

import { UpdateMulterDto } from "../dto/update-multer.dto";
import { FileUploadService } from "../service/multer.service";

/**
 * Controller for file management endpoints.
 *
 * This controller provides RESTful endpoints for uploading, retrieving, updating, deleting,
 * and downloading files. All endpoints are protected by JWT authentication.
 *
 * @example
 * ```typescript
 * // Upload a file
 * POST /users/files/upload
 * Content-Type: multipart/form-data
 * Body: { file: <file> }
 *
 * // Get file metadata by ID
 * GET /users/files/1
 *
 * // Download file by ID
 * GET /users/files/download/1
 *
 * // Update file metadata
 * PATCH /users/files/1
 * Body: { name: "newname.txt" }
 *
 * // Delete file
 * DELETE /users/files/1
 * ```
 *
 * @see {@link https://docs.nestjs.com/controllers NestJS Controllers}
 * @see {@link https://docs.nestjs.com/techniques/file-upload NestJS File Upload}
 * @see {@link https://swagger.io/docs/ NestJS Swagger}
 */
@UseGuards(AuthGuard)
@ApiTags("files")
@ApiBearerAuth()
@Controller({
  path: "users/files",
  version: "1",
})
export class FileUploadController {
  /**
   * Logger instance for this controller.
   */
  private readonly logger = new Logger(FileUploadController.name);

  /**
   * Creates an instance of FileUploadController.
   * @param fileUploadService The service for file operations.
   */
  constructor(private readonly fileUploadService: FileUploadService) {}

  /**
   * Upload a new file.
   *
   * Accepts a file via multipart/form-data and stores it on disk and in the database.
   *
   * @param file The file to upload.
   * @returns File upload result including metadata.
   * @throws {BadRequestException} If the file is invalid.
   *
   * @example
   * ```typescript
   * POST /users/files/upload
   * Content-Type: multipart/form-data
   * Body: { file: <file> }
   * ```
   */
  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "Upload a file", description: "Uploads a new file." })
  @ApiResponse({ status: 201, description: "File uploaded successfully." })
  @ApiResponse({ status: 400, description: "Invalid file or upload error." })
  @ApiBody({ type: "multipart/form-data", required: true })
  @ApiQuery({ name: "uuid", type: String, required: true })
  uploadFile(@UploadedFile() file: Express.Multer.File, @Query("uuid") uuid: string) {
    this.logger.debug(`uploadFile endpoint called with file: ${file?.originalname}`);
    if (!file) {
      this.logger.warn("No file uploaded");
      throw new BadRequestException("no file uploaded", {
        description: "Please upload a file to proceed.",
        cause: "File upload is required",
      });
    }

    if (!uuid) {
      this.logger.warn("User UUID not found in request");
      throw new BadRequestException("User UUID not found", {
        description: "Please provide a valid user UUID.",
        cause: "User UUID is required for file upload",
      });
    }

    const result = UuidSchema.safeParse(uuid);
    if (!result.success) {
      this.logger.error("Invalid UUID format", result.error);
      throw new BadRequestException("Invalid UUID format");
    }
    return this.fileUploadService.handleFileUpload(file, uuid);
  }

  /**
   * Get a file by its ID.
   *
   * Retrieves file metadata from the database by its unique ID.
   *
   * @param id The file ID.
   * @returns The file metadata.
   * @throws {NotFoundException} If the file is not found.
   *
   * @example
   * ```typescript
   * GET /users/files/1
   * ```
   */
  @Get(":id")
  @ApiOperation({ summary: "Get file by ID", description: "Retrieves a file by its ID." })
  @ApiResponse({ status: 200, description: "File found." })
  @ApiResponse({ status: 404, description: "File not found." })
  @ApiParam({ name: "id", type: Number, required: true, description: "File ID" })
  @ApiQuery({ name: "uuid", type: String, required: true })
  async getFile(@Param("id") id: number, @Query("uuid") uuid: string) {
    this.logger.debug(`getFile endpoint called with id: ${id}`);
    if (!uuid) {
      this.logger.warn("User UUID not found in request");
      throw new NotFoundException("User UUID not found");
    }

    const result = UuidSchema.safeParse(uuid);
    if (!result.success) {
      this.logger.error("Invalid UUID format", result.error);
      throw new NotFoundException("Invalid UUID format");
    }

    const file = await this.fileUploadService.getFileByIdForUser(id, uuid);
    if (!file) {
      this.logger.warn(`File not found in controller: ${id}`);
      throw new NotFoundException("File not found");
    }
    return { success: true, data: file };
  }

  /**
   * Get all files.
   *
   * Retrieves metadata for all uploaded files.
   *
   * @returns List of all files.
   *
   * @example
   * ```typescript
   * GET /users/files
   * ```
   */
  @Get()
  @ApiOperation({ summary: "Get all files", description: "Retrieves all uploaded files." })
  @ApiResponse({ status: 200, description: "List of files." })
  @ApiQuery({ name: "uuid", type: String, required: true })
  async getAllFiles(@Query("uuid") uuid: string) {
    this.logger.debug("getAllFiles endpoint called");
    if (!uuid) {
      this.logger.warn("User UUID not found in request");
      throw new NotFoundException("User UUID not found");
    }

    const result = UuidSchema.safeParse(uuid);
    if (!result.success) {
      this.logger.error("Invalid UUID format", result.error);
      throw new NotFoundException("Invalid UUID format");
    }
    return { success: true, data: await this.fileUploadService.getAllFilesForUser(uuid) };
  }

  /**
   * Update file metadata.
   *
   * Updates file metadata such as name, path, mimeType, etc.
   *
   * @param id The file ID.
   * @param updateDto The update data (UpdateMulterDto).
   * @param uuid The user UUID.
   * @returns Updated file data.
   * @throws {NotFoundException} If the file is not found.
   * @throws {BadRequestException} If update data is invalid.
   *
   * @example
   * ```typescript
   * PATCH /users/files/1
   * Body: { name: "newname.txt" }
   * ```
   * @see {@link UpdateMulterDto}
   */
  @Patch(":id")
  @ApiOperation({ summary: "Update file", description: "Updates file metadata." })
  @ApiResponse({ status: 200, description: "File updated successfully." })
  @ApiResponse({ status: 400, description: "Invalid update data." })
  @ApiResponse({ status: 404, description: "File not found." })
  @ApiParam({ name: "id", type: Number, required: true, description: "File ID" })
  @ApiBody({ type: UpdateMulterDto, required: true, description: "File update data" })
  @ApiQuery({ name: "uuid", type: String, required: true })
  async updateFile(@Param("id") id: number, @Body() updateDto: UpdateMulterDto, @Query("uuid") uuid: string) {
    this.logger.debug(`updateFile endpoint called with id: ${id}, data: ${JSON.stringify(updateDto)}`);
    if (!uuid) {
      this.logger.warn("User UUID not found in request");
      throw new NotFoundException("User UUID not found");
    }

    const result = UuidSchema.safeParse(uuid);
    if (!result.success) {
      this.logger.error("Invalid UUID format", result.error);
      throw new BadRequestException("Invalid UUID format");
    }
    const updated = await this.fileUploadService.updateFileForUser(id, updateDto, uuid);
    if (!updated) {
      this.logger.warn(`File not found for update in controller: ${id}`);
      throw new NotFoundException("File not found");
    }
    return { success: true, data: updated };
  }

  /**
   * Delete a file by its ID.
   *
   * Removes a file record from the database and deletes the file from disk.
   *
   * @param id The file ID.
   * @returns Deletion result.
   * @throws {NotFoundException} If the file is not found.
   *
   * @example
   * ```typescript
   * DELETE /users/files/1
   * ```
   */
  @Delete(":id")
  @ApiOperation({ summary: "Delete file", description: "Deletes a file by its ID." })
  @ApiResponse({ status: 200, description: "File deleted successfully." })
  @ApiResponse({ status: 404, description: "File not found." })
  @ApiParam({ name: "id", type: Number, required: true, description: "File ID" })
  @ApiQuery({ name: "uuid", type: String, required: true })
  async deleteFile(@Param("id") id: number, @Query("uuid") uuid: string) {
    this.logger.debug(`deleteFile endpoint called with id: ${id}`);
    if (!uuid) {
      this.logger.warn("User UUID not found in request");
      throw new NotFoundException("User UUID not found");
    }

    const result = UuidSchema.safeParse(uuid);
    if (!result.success) {
      this.logger.error("Invalid UUID format", result.error);
      throw new BadRequestException("Invalid UUID format");
    }

    const deleted = await this.fileUploadService.deleteFileForUser(id, uuid);
    if (!deleted) {
      this.logger.warn(`File not found for deletion in controller: ${id}`);
      throw new NotFoundException("File not found");
    }
    return { success: true, message: "File deleted successfully" };
  }

  /**
   * Download the physical file by its ID.
   *
   * Sends the actual file stored on disk to the client.
   *
   * @param id The file ID.
   * @param res The HTTP response object.
   * @returns The physical file.
   * @throws {NotFoundException} If the file does not exist.
   *
   * @example
   * ```typescript
   * GET /users/files/download/1
   * ```
   *
   * @see {@link https://docs.nestjs.com/techniques/file-upload NestJS File Upload}
   * @see {@link https://expressjs.com/en/api.html#res.sendFile Express sendFile}
   */
  @Get("download/:id")
  @ApiOperation({ summary: "Download physical file", description: "Downloads the physical file by its ID." })
  @ApiResponse({ status: 200, description: "File downloaded successfully." })
  @ApiResponse({ status: 404, description: "File not found." })
  @ApiParam({ name: "id", type: Number, required: true, description: "File ID" })
  @ApiQuery({ name: "uuid", type: String, required: true })
  async downloadFile(@Param("id") id: number, @Res() res: any, @Query("uuid") uuid: string) {
    this.logger.debug(`downloadFile endpoint called with id: ${id}`);
    if (!uuid) {
      this.logger.warn("User UUID not found in request");
      throw new NotFoundException("User UUID not found");
    }

    const result = UuidSchema.safeParse(uuid);
    if (!result.success) {
      this.logger.error("Invalid UUID format", result.error);
      throw new BadRequestException("Invalid UUID format");
    }

    const file = await this.fileUploadService.getFileByIdForUser(id, uuid);
    if (!file) {
      this.logger.warn(`File not found for download: ${id}`);
      throw new NotFoundException("File not found");
    }
    // Send the physical file
    return res.sendFile(file.path, { root: "." }, (err: Error) => {
      if (err) {
        this.logger.error(`Error sending file: ${err.message}`);
        res.status(404).json({ success: false, message: "File not found on disk" });
      }
    });
  }
}
