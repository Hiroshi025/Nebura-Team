import { FileUploadSchema } from "#adapters/schemas/files.schema";
import { FileEntity } from "#entity/utils/file.entity";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { Repository } from "typeorm";
import { ZodError } from "zod";

import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { UpdateMulterDto } from "../dto/update-multer.dto";

/**
 * Service for file upload and management.
 *
 * Handles file upload, retrieval, update, and deletion logic.
 *
 * @example
 * ```typescript
 * const file = await fileUploadService.handleFileUpload(multerFile, userUuid);
 * const metadata = await fileUploadService.getFileById(1);
 * const files = await fileUploadService.getAllFiles();
 * const updated = await fileUploadService.updateFile(1, { name: "new.txt" });
 * const deleted = await fileUploadService.deleteFile(1);
 * ```
 *
 * @see {@link https://docs.nestjs.com/providers NestJS Providers}
 * @see {@link https://typeorm.io/#/repository-api TypeORM Repository API}
 * @see {@link https://github.com/colinhacks/zod Zod Validation}
 * @see {@link https://docs.nestjs.com/techniques/validation NestJS Validation}
 * @see {@link https://github.com/typestack/class-validator class-validator}
 */
@Injectable()
export class FileUploadService {
  /**
   * Logger instance for this service.
   */
  private readonly logger = new Logger(FileUploadService.name);

  /**
   * Creates an instance of FileUploadService.
   * @param fileRepository TypeORM repository for FileEntity.
   */
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
  ) {}

  /**
   * Handles file upload.
   *
   * Validates the file type and size, checks metadata with Zod, and saves the file metadata to the database.
   *
   * @param file The uploaded file from Multer.
   * @returns Upload result with file metadata.
   * @throws {BadRequestException} If file is invalid.
   *
   * @example
   * ```typescript
   * const result = await fileUploadService.handleFileUpload(multerFile);
   * ```
   */
  async handleFileUpload(file: Express.Multer.File, userUuid: string) {
    this.logger.debug(`handleFileUpload called with file: ${file?.originalname}`);

    if (!file) {
      this.logger.warn("No file uploaded");
      throw new BadRequestException("no file uploaded", {
        description: "Please upload a file to proceed.",
        cause: "File upload is required",
      });
    }

    // Validate file type
    const allowedMimeTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      this.logger.warn(`Invalid file type: ${file.mimetype}`);
      throw new BadRequestException("invalid file type", {
        description: "Allowed file types are: JPEG, PNG, PDF.",
        cause: "File type not supported",
      });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.logger.warn(`File too large: ${file.size}`);
      throw new BadRequestException("file is too large!", {
        description: "File size must be less than 5MB.",
        cause: "File size exceeded",
      });
    }

    // Zod validation
    try {
      FileUploadSchema.parse({
        name: file.originalname,
        path: file.path,
        mimeType: file.mimetype,
        size: String(file.size),
        checksum: "simulated-checksum", // You may want to calculate a real checksum
      });
    } catch (err) {
      this.logger.error("Zod validation failed", err instanceof ZodError ? err.message : err);
      throw new BadRequestException("File data validation failed", {
        description: "File data does not match schema",
        cause: err,
      });
    }

    // Save to database
    const fileEntity = this.fileRepository.create({
      name: file.originalname,
      path: file.path,
      mimeType: file.mimetype,
      size: String(file.size),
      checksum: "simulated-checksum",
      userUuid, // Nuevo campo
    });
    await this.fileRepository.save(fileEntity);

    this.logger.log(`File uploaded and saved: ${fileEntity.id}`);
    return { message: "File uploaded successfully", file: fileEntity };
  }

  /**
   * Retrieves a file by its ID.
   *
   * @param id File ID.
   * @returns File metadata or null if not found.
   *
   * @example
   * ```typescript
   * const file = await fileUploadService.getFileById(1);
   * ```
   */
  async getFileById(id: number) {
    this.logger.debug(`getFileById called with id: ${id}`);
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) this.logger.warn(`File not found: ${id}`);
    return file;
  }

  async getFileByIdForUser(id: number, userUuid: string) {
    this.logger.debug(`getFileByIdForUser called with id: ${id}, userUuid: ${userUuid}`);
    const file = await this.fileRepository.findOne({ where: { id, userUuid } });
    if (!file) this.logger.warn(`File not found: ${id}`);
    return file;
  }

  /**
   * Retrieves all files.
   *
   * @returns Array of file metadata.
   *
   * @example
   * ```typescript
   * const files = await fileUploadService.getAllFiles();
   * ```
   */
  async getAllFiles() {
    this.logger.debug("getAllFiles called");
    return await this.fileRepository.find();
  }

  async getAllFilesForUser(userUuid: string) {
    this.logger.debug(`getAllFilesForUser called for userUuid: ${userUuid}`);
    return await this.fileRepository.find({ where: { userUuid } });
  }

  /**
   * Updates file metadata using UpdateMulterDto.
   *
   * Validates update data with Zod and class-validator, then updates the file record in the database.
   *
   * @param id File ID.
   * @param updateDto UpdateMulterDto instance containing partial file metadata.
   * @returns Updated file or null if not found.
   * @throws {BadRequestException} If update data is invalid.
   *
   * @example
   * ```typescript
   * const updateDto = new UpdateMulterDto();
   * updateDto.name = "new.txt";
   * const updated = await fileUploadService.updateFile(1, updateDto);
   * ```
   *
   * @see {@link https://docs.nestjs.com/techniques/validation NestJS Validation}
   * @see {@link https://typeorm.io/#/repository-api TypeORM Repository API}
   */
  async updateFile(id: number, updateDto: UpdateMulterDto) {
    this.logger.debug(`updateFile called with id: ${id}, data: ${JSON.stringify(updateDto)}`);
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      this.logger.warn(`File not found for update: ${id}`);
      return null;
    }

    // Zod validation for update
    try {
      FileUploadSchema.partial().parse(updateDto);
    } catch (err) {
      this.logger.error("Zod validation failed on update", err instanceof ZodError ? err.message : err);
      throw new BadRequestException("File update data validation failed", {
        description: "Update data does not match schema",
        cause: err,
      });
    }

    Object.assign(file, updateDto);
    await this.fileRepository.save(file);

    this.logger.log(`File updated: ${file.id}`);
    return file;
  }

  /**
   * Updates file metadata for a specific user using UpdateMulterDto.
   *
   * Validates update data with Zod and class-validator, then updates the file record in the database.
   *
   * @param id File ID.
   * @param updateDto UpdateMulterDto instance containing partial file metadata.
   * @param userUuid UUID of the user associated with the file.
   * @returns Updated file or null if not found.
   * @throws {BadRequestException} If update data is invalid.
   *
   * @example
   * ```typescript
   * const updateDto = new UpdateMulterDto();
   * updateDto.name = "new.txt";
   * const updated = await fileUploadService.updateFileForUser(1, updateDto, "user-uuid");
   * ```
   *
   * @see {@link https://docs.nestjs.com/techniques/validation NestJS Validation}
   * @see {@link https://typeorm.io/#/repository-api TypeORM Repository API}
   */
  async updateFileForUser(id: number, updateDto: UpdateMulterDto, userUuid: string) {
    this.logger.debug(`updateFileForUser called with id: ${id}, userUuid: ${userUuid}, data: ${JSON.stringify(updateDto)}`);
    const file = await this.fileRepository.findOne({ where: { id, userUuid } });
    if (!file) {
      this.logger.warn(`File not found for update: ${id}`);
      return null;
    }

    // Zod validation for update
    try {
      FileUploadSchema.partial().parse(updateDto);
    } catch (err) {
      this.logger.error("Zod validation failed on update", err instanceof ZodError ? err.message : err);
      throw new BadRequestException("File update data validation failed", {
        description: "Update data does not match schema",
        cause: err,
      });
    }

    Object.assign(file, updateDto);
    await this.fileRepository.save(file);

    this.logger.log(`File updated: ${file.id}`);
    return file;
  }

  /**
   * Deletes a file by its ID.
   *
   * Removes the file record from the database.
   *
   * @param id File ID.
   * @returns True if deleted, false otherwise.
   *
   * @example
   * ```typescript
   * const deleted = await fileUploadService.deleteFile(1);
   * ```
   */
  async deleteFile(id: number) {
    this.logger.debug(`deleteFile called with id: ${id}`);
    const result = await this.fileRepository.delete(id);
    if (result.affected === 0) {
      this.logger.warn(`File not found for deletion: ${id}`);
      return false;
    }
    this.logger.log(`File deleted: ${id}`);
    return true;
  }

  async deleteFileForUser(id: number, userUuid: string) {
    this.logger.debug(`deleteFileForUser called with id: ${id}, userUuid: ${userUuid}`);
    const result = await this.fileRepository.delete({ id, userUuid });
    if (result.affected === 0) {
      this.logger.warn(`File not found for deletion: ${id}`);
      return false;
    }
    this.logger.log(`File deleted: ${id}`);
    return true;
  }

  /**
   * Replaces the physical file for a given file ID and user UUID.
   *
   * Deletes the old file from disk and saves the new one, updating metadata in the database.
   *
   * @param id File ID.
   * @param file New file to replace the old one.
   * @param userUuid User UUID.
   * @returns Updated file metadata or null if not found.
   * @throws {BadRequestException} If file is invalid.
   */
  async replaceFile(id: number, file: Express.Multer.File, userUuid: string) {
    this.logger.debug(`replaceFile called with id: ${id}, userUuid: ${userUuid}, file: ${file?.originalname}`);
    const fileEntity = await this.fileRepository.findOne({ where: { id, userUuid } });
    if (!fileEntity) {
      this.logger.warn(`File not found for replacement: ${id}`);
      return null;
    }

    // Delete old physical file
    try {
      await fs.unlink(path.resolve(fileEntity.path));
    } catch (err: any) {
      this.logger.error(`Error deleting old file: ${err.message}`);
      // Continue even if file does not exist
    }

    // Validate new file
    const allowedMimeTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      this.logger.warn(`Invalid file type: ${file.mimetype}`);
      throw new BadRequestException("Invalid file type", {
        description: "Allowed file types are: JPEG, PNG, PDF.",
        cause: "File type not supported",
      });
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.logger.warn(`File too large: ${file.size}`);
      throw new BadRequestException("File is too large!", {
        description: "File size must be less than 5MB.",
        cause: "File size exceeded",
      });
    }

    // Zod validation
    try {
      FileUploadSchema.parse({
        name: file.originalname,
        path: file.path,
        mimeType: file.mimetype,
        size: String(file.size),
        checksum: "simulated-checksum",
      });
    } catch (err) {
      this.logger.error("Zod validation failed", err instanceof ZodError ? err.message : err);
      throw new BadRequestException("File data validation failed", {
        description: "File data does not match schema",
        cause: err,
      });
    }

    // Update metadata
    fileEntity.name = file.originalname;
    fileEntity.path = file.path;
    fileEntity.mimeType = file.mimetype;
    fileEntity.size = String(file.size);
    fileEntity.checksum = "simulated-checksum";
    await this.fileRepository.save(fileEntity);

    this.logger.log(`File replaced and updated: ${fileEntity.id}`);
    return fileEntity;
  }

  /**
   * Returns the history (versions) of a file.
   *
   * If versioning is not implemented, returns only the current version.
   *
   * @param id File ID.
   * @param userUuid User UUID.
   * @returns Array of file versions metadata.
   */
  async getFileHistory(id: number, userUuid: string) {
    this.logger.debug(`getFileHistory called with id: ${id}, userUuid: ${userUuid}`);
    // Simulate versioning: return only current version
    const file = await this.fileRepository.findOne({ where: { id, userUuid } });
    if (!file) {
      this.logger.warn(`File not found for history: ${id}`);
      return [];
    }
    // If you have a version table, fetch all versions here
    return [file];
  }

  /**
   * Generates a temporary share link for a file.
   *
   * Creates a unique token and returns a link for temporary download.
   *
   * @param id File ID.
   * @param userUuid User UUID.
   * @returns Temporary share link or null if file not found.
   */
  async generateShareLink(id: number, userUuid: string) {
    this.logger.debug(`generateShareLink called with id: ${id}, userUuid: ${userUuid}`);
    const file = await this.fileRepository.findOne({ where: { id, userUuid } });
    if (!file) {
      this.logger.warn(`File not found for share link: ${id}`);
      return null;
    }
    // Generate a random token
    const token = crypto.randomBytes(24).toString("hex");
    // Simulate storing token and expiration (implement persistent storage if needed)
    // For now, just return the link
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const expiresInMinutes = 60;
    // You should store {token, fileId, userUuid, expiresAt} in a DB for real implementation
    return `${baseUrl}/users/files/shared/${token}?expires=${Date.now() + expiresInMinutes * 60000}`;
  }
}
