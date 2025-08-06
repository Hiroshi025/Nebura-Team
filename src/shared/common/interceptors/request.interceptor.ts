/* eslint-disable @typescript-eslint/require-await */
import { RequestStatEntity } from "#entity/utils/metrics/request.entity";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { DataSource } from "typeorm";

/* eslint-disable @typescript-eslint/no-misused-promises */
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";

/**
 * Interceptor that collects and stores request metrics for each HTTP request.
 *
 * This interceptor tracks request latency, error count, and request count per endpoint and client.
 * Metrics are stored in the database using the {@link RequestStatEntity}.
 *
 * Requests to endpoints containing `/dashboard` are excluded from metrics collection.
 * If the request does not contain the `x-client-id` header, metrics are not collected.
 *
 * @example
 * // Usage in a controller or globally
 * @UseInterceptors(RequestMetricsInterceptor)
 * @Get('api/data')
 * async getData() {
 *   // Metrics for this endpoint will be collected
 * }
 *
 * @see {@link https://docs.nestjs.com/interceptors NestJS Interceptors}
 * @see {@link https://typeorm.io/#/repository-api TypeORM Repository API}
 */
@Injectable()
export class RequestMetricsInterceptor implements NestInterceptor {
  /**
   * Logger instance for this interceptor.
   */
  private readonly logger = new Logger(RequestMetricsInterceptor.name);

  /**
   * Creates a new instance of RequestMetricsInterceptor.
   *
   * @param dataSource - The TypeORM DataSource for accessing repositories.
   */
  constructor(private dataSource: DataSource) {}

  /**
   * Intercepts incoming HTTP requests to collect metrics.
   *
   * @param context - The execution context of the request.
   * @param next - The next handler in the request pipeline.
   * @returns An Observable that emits the response, after metrics are collected.
   *
   * @example
   * await interceptor.intercept(context, next);
   */
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req: { path: string; headers: any } = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    if (context.getType() !== "http") {
      return next.handle();
    }

    if (req.path && req.path.includes("/dashboard")) {
      return next.handle();
    }

    const start = process.hrtime();
    const clientId = req.headers["x-client-id"];
    if (!clientId) {
      this.logger.warn("Request missing client ID header, skipping metrics collection.");
      return next.handle();
    }

    return next.handle().pipe(
      tap(async () => {
        const [seconds, nanoseconds] = process.hrtime(start);
        const latency = seconds * 1e3 + nanoseconds / 1e6;
        const isError = res.statusCode >= 400;

        const repo = this.dataSource.getRepository(RequestStatEntity);
        const identifier = `${req.path}-${clientId || "null"}-${req.headers["user-agent"] || "unknown"}`;

        try {
          let stat = await repo.findOneBy({ identifier });

          if (stat) {
            stat.requests += 1;
            if (isError) stat.errors += 1;
            stat.latency = latency;
            await repo.save(stat);
          } else {
            stat = repo.create({
              identifier,
              endpoint: req.path,
              clientId: clientId,
              system: req.headers["user-agent"] || "unknown",
              requests: 1,
              errors: isError ? 1 : 0,
              latency,
            });
            this.logger.debug(`Creating new request stat for identifier: ${identifier}`);
            await repo.save(stat);
          }
        } catch (err: any) {
          this.logger.error(`Error saving request metrics: ${err.message}`, err.stack);
          console.log(err);
        }
      }),
    );
  }
}
