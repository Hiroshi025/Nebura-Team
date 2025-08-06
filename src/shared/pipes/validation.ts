/**
 * @fileoverview
 * Provides the `ValidationPipeOptions` interface for customizing NestJS validation pipes.
 * Extends the base options from `class-validator` and adds additional NestJS-specific options.
 *
 * @see [NestJS Pipes Documentation](https://docs.nestjs.com/pipes)
 * @see [class-validator Options](https://github.com/typestack/class-validator#validation-options)
 *
 * @example
 * import { ValidationPipe } from '@nestjs/common';
 * import { ValidationPipeOptions } from './validation';
 *
 * const options: ValidationPipeOptions = {
 *   transform: true,
 *   whitelist: true,
 *   forbidNonWhitelisted: true,
 *   exceptionFactory: (errors) => new MyCustomException(errors),
 * };
 *
 * app.useGlobalPipes(new ValidationPipe(options));
 */

import { ValidatorOptions } from "class-validator";

import { ValidationError } from "@nestjs/common";

/**
 * Options for configuring the NestJS ValidationPipe.
 *
 * Extends {@link ValidatorOptions} from `class-validator` and adds additional options
 * specific to NestJS validation behavior.
 *
 * @property {boolean} [transform] - If true, automatically transforms payloads to be objects typed according to their DTO classes.
 * @property {boolean} [disableErrorMessages] - If true, disables detailed error messages to improve security.
 * @property {(errors: ValidationError[]) => any} [exceptionFactory] - Custom factory function to create exceptions from validation errors.
 *
 * @see [NestJS ValidationPipe](https://docs.nestjs.com/techniques/validation)
 */
export interface ValidationPipeOptions extends ValidatorOptions {
  /**
   * Automatically transform payloads to DTO instances.
   * @default false
   */
  transform?: boolean;

  /**
   * Disable detailed error messages for validation errors.
   * Useful for production environments to avoid leaking sensitive information.
   * @default false
   */
  disableErrorMessages?: boolean;

  /**
   * Custom factory function to create exceptions from validation errors.
   *
   * @param errors - Array of validation errors.
   * @returns Any exception object.
   *
   * @example
   * exceptionFactory: (errors) => new BadRequestException(errors)
   */
  exceptionFactory?: (errors: ValidationError[]) => any;
}
