import { JwtConfigModule } from "#/core/jwt.module";
import { UserEntity } from "#entity/users/user.entity";
import { FileEntity } from "#entity/utils/file.entity";
import { LicenseEntity } from "#entity/utils/licence.entity";
import fs from "fs";
import { diskStorage } from "multer";

import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { TypeOrmModule } from "@nestjs/typeorm";

import { FileUploadController } from "./controllers/multer.controller";
import { PublicUserController } from "./controllers/public.controller";
import { FileUploadService } from "./service/multer.service";
import { UserService } from "./service/users.service";

/**
 * UsersModule is responsible for providing user-related services and controllers.
 *
 * This module integrates user and file entities with TypeORM, configures file upload handling with Multer,
 * and provides controllers and services for user and file management.
 *
 * ## Example
 * ```typescript
 * import { UsersModule } from './users.module';
 * // Add UsersModule to your application's imports array
 * ```
 *
 * ### Features
 * - User management via {@link UserService}
 * - File upload and management via {@link FileUploadService}
 * - REST endpoints via {@link PublicUserController} and {@link FileUploadController}
 * - JWT authentication via {@link JwtConfigModule}
 * - File storage configuration using Multer and diskStorage
 *
 * @see {@link https://docs.nestjs.com/modules NestJS Modules}
 * @see {@link https://docs.nestjs.com/techniques/file-upload NestJS File Upload}
 * @see {@link https://typeorm.io/#/entities TypeORM Entities}
 */
@Module({
  imports: [
    /**
     * Registers UserEntity and FileEntity for TypeORM repository injection.
     * @see {@link https://typeorm.io/#/modules}
     */
    TypeOrmModule.forFeature([UserEntity, FileEntity, LicenseEntity]),
    /**
     * Configures Multer for file uploads.
     * Uses diskStorage to save files to the path specified by the MULTER_PATH environment variable.
     * Filenames are prefixed with the current timestamp for uniqueness.
     * @see {@link https://docs.nestjs.com/techniques/file-upload}
     */
    MulterModule.register({
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const basePath = process.env.MULTER_PATH || "uploads";
          if (!fs.existsSync(basePath)) {
            fs.mkdirSync(basePath, { recursive: true });
          }
          cb(null, basePath);
        },
        filename: (__req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
    /**
     * JWT configuration module for authentication.
     * @see {@link https://docs.nestjs.com/security/authentication}
     */
    JwtConfigModule,
  ],
  providers: [
    /**
     * Provides user and file services for dependency injection.
     */
    UserService,
    FileUploadService,
  ],
  controllers: [
    /**
     * Exposes REST endpoints for user and file operations.
     */
    PublicUserController,
    FileUploadController,
  ],
  exports: [
    /**
     * Exports services for use in other modules.
     */
    UserService,
    FileUploadService,
  ],
})
export class UsersModule {
  /**
   * Configures middleware for specific user-related routes.
   *
   * The AuthMiddleware is applied to the following routes:
   * - GET /users/find-by-uuid (v1)
   * - GET /users/find-by-email (v1)
   *
   * @param consumer - The MiddlewareConsumer instance used to apply middleware.
   * @see {@link https://docs.nestjs.com/middleware#applying-middleware NestJS: Applying Middleware}
   */
  configure() {
    // No custom middleware configured in this example.
  }
}
