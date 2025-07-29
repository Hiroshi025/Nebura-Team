import { ExecutionContext, Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

/**
 * `HttpThrottlerGuard` is a custom guard that extends NestJS's {@link ThrottlerGuard}.
 *
 * This guard applies rate limiting only to HTTP requests. For other types of requests
 * (such as Discord events or WebSocket connections), it allows access without throttling.
 *
 * ## Usage
 *
 * Register this guard globally or at the controller/route level to enable HTTP-specific throttling.
 *
 * ```typescript
 * // In your module
 * import { APP_GUARD } from '@nestjs/core';
 * import { HttpThrottlerGuard } from './shared/common/guards/http-throttler.guard';
 *
 * @Module({
 *   providers: [
 *     {
 *       provide: APP_GUARD,
 *       useClass: HttpThrottlerGuard,
 *     },
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * ## Example
 *
 * If a request is made via HTTP, the guard will enforce the throttling rules:
 *
 * ```typescript
 * // HTTP request
 * GET /api/resource
 * // Throttling is applied
 * ```
 *
 * If a request is made via another transport (e.g., Discord event):
 *
 * ```typescript
 * // Discord event
 * onMessageReceived()
 * // Throttling is NOT applied
 * ```
 *
 * ## See Also
 * - [NestJS Throttler Documentation](https://github.com/nestjs/throttler)
 * - [NestJS Guards](https://docs.nestjs.com/guards)
 *
 * @extends ThrottlerGuard
 */
@Injectable()
export class HttpThrottlerGuard extends ThrottlerGuard {
  /**
   * Determines whether the current request should be rate-limited.
   *
   * Only applies throttling if the request type is HTTP. For other types,
   * access is always allowed.
   *
   * @param context - The execution context of the request.
   * @returns A promise that resolves to `true` if access is allowed, or `false` if throttled.
   *
   * @example
   * // HTTP request
   * await guard.canActivate(context); // Throttling is applied
   *
   * // Discord event
   * await guard.canActivate(context); // Always returns true
   */
  canActivate(context: ExecutionContext): Promise<boolean> {
    // Only apply the guard if it's an HTTP request
    if (context.getType() === "http") {
      return super.canActivate(context);
    }
    // If not HTTP (e.g., Discord events), allow access
    return Promise.resolve(true);
  }
}
