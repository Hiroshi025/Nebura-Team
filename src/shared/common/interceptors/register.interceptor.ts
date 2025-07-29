import { SKIP_LOGGING_KEY } from "#common/decorators/logging.decorator";
import { Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";

import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

/**
 * LoggingInterceptor is a NestJS HTTP interceptor that logs the start and end of each HTTP request,
 * including the HTTP method, URL, and the time taken to process the request.
 *
 * It also logs errors if they occur during the request lifecycle.
 *
 * @example
 * // Usage in a controller or globally:
 * import { APP_INTERCEPTOR } from '@nestjs/core';
 *
 * @Module({
 *   providers: [
 *     {
 *       provide: APP_INTERCEPTOR,
 *       useClass: LoggingInterceptor,
 *     },
 *   ],
 * })
 * export class AppModule {}
 *
 * @see https://docs.nestjs.com/interceptors
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  /**
   * Logger instance used for logging request lifecycle events.
   */
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(private readonly reflector: Reflector) {}

  /**
   * Intercepts incoming HTTP requests and logs their lifecycle events.
   *
   * @param context - The execution context of the request.
   * @param next - The call handler to proceed with the request.
   * @returns An Observable that emits the response or error.
   *
   * @example
   * // The interceptor automatically logs:
   * // [GET] /api/users - Start
   * // [GET] /api/users - End (12.34 ms)
   * // or in case of error:
   * // [GET] /api/users - Error after 12.34 ms: NotFoundException
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Verifica si el decorador está presente
    const skipLogging = this.reflector.getAllAndOverride<boolean>(SKIP_LOGGING_KEY, [context.getHandler(), context.getClass()]);
    if (skipLogging) {
      return next.handle();
    }

    // Get the HTTP request object
    const req = context.switchToHttp().getRequest();
    // Extract HTTP method (GET, POST, etc.)
    const method = req?.method;
    // Extract the original URL or fallback to req.url
    const url = req?.originalUrl || req?.url;
    // Start high-resolution timer
    const start = process.hrtime();

    // Log the start of the request
    this.logger.log(`[${method}] ${url} - Start`);

    return next.handle().pipe(
      tap(() => {
        // Calculate elapsed time
        const diff = process.hrtime(start);
        const duration = (diff[0] * 1e3 + diff[1] / 1e6).toFixed(2); // ms
        // Log the end of the request with duration
        this.logger.log(`[${method}] ${url} - End (${duration} ms)`);
      }),
      catchError((err) => {
        // Calculate elapsed time on error
        const diff = process.hrtime(start);
        const duration = (diff[0] * 1e3 + diff[1] / 1e6).toFixed(2);
        // Log the error with duration and error message
        this.logger.error(`[${method}] ${url} - Error after ${duration} ms: ${err.message}`);
        throw err;
      }),
    );
  }
}
