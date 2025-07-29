import { SetMetadata } from "@nestjs/common";

/**
 * The metadata key used to indicate that logging should be skipped for a specific route or handler.
 *
 * @see {@link SkipLogging}
 */
export const SKIP_LOGGING_KEY = "skipLogging";

/**
 * Decorator that marks a route or handler to skip logging.
 *
 * This decorator sets a metadata flag (`skipLogging`) on the target, which can be checked in interceptors or guards
 * to conditionally disable logging for specific endpoints.
 *
 * @example
 * ```typescript
 * import { SkipLogging } from './logging.decorator';
 *
 * @SkipLogging()
 * @Get('health')
 * healthCheck() {
 *   return { status: 'ok' };
 * }
 * ```
 *
 * @remarks
 * - This decorator is typically used in combination with custom logging interceptors.
 * - The metadata can be accessed using `Reflector` from `@nestjs/core`.
 *
 * @see [NestJS Custom Decorators](https://docs.nestjs.com/custom-decorators)
 * @see [NestJS Metadata Reflection](https://docs.nestjs.com/techniques/metadata)
 *
 * @returns {MethodDecorator & ClassDecorator} A decorator function to set the skipLogging metadata.
 */
export const SkipLogging = (): MethodDecorator & ClassDecorator => SetMetadata(SKIP_LOGGING_KEY, true);
