/* eslint-disable @typescript-eslint/restrict-template-expressions */
/**
 * Custom logger implementation using Winston and NestJS ConsoleLogger.
 *
 * This logger writes logs to rotating files and also handles exceptions and unhandled promise rejections.
 *
 * @see https://github.com/winstonjs/winston
 * @see https://docs.nestjs.com/techniques/logger
 * @example
 * // Usage in a NestJS service
 * import { LoggerService } from './shared/utils/custom-logger';
 *
 * @Injectable()
 * export class MyService {
 *   constructor(private readonly logger: LoggerService) {}
 *
 *   doSomething() {
 *     this.logger.log('Doing something...');
 *     this.logger.error('Something went wrong!');
 *   }
 * }
 */
import "winston-daily-rotate-file";

import { createLogger, format, transports } from "winston";

import { ConsoleLogger, ConsoleLoggerOptions, Injectable } from "@nestjs/common";

/**
 * The log level for Winston logger.
 * Can be set via environment variable LOG_LEVEL.
 * @default "info"
 */
const logLevel = process.env.LOG_LEVEL || "info";

/**
 * Winston logger instance configured for daily rotating file logs.
 *
 * @see https://github.com/winstonjs/winston-daily-rotate-file
 */
const fileLogger = createLogger({
  level: logLevel,
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`),
  ),
  transports: [
    new transports.DailyRotateFile({
      filename: "logs/application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: false,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

/**
 * Handles uncaught exceptions and writes them to a separate log file.
 */
fileLogger.exceptions.handle(
  new transports.DailyRotateFile({
    filename: "logs/exceptions-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: false,
    maxSize: "20m",
    maxFiles: "14d",
  }),
);

/**
 * Handles unhandled promise rejections and logs them.
 *
 * @see https://nodejs.org/api/process.html#event-unhandledrejection
 */
process.on("unhandledRejection", (reason: any) => {
  fileLogger.error(`Unhandled Rejection: ${typeof reason === "string" ? reason : JSON.stringify(reason)}`);
});

/**
 * LoggerService extends NestJS ConsoleLogger and adds file logging via Winston.
 *
 * @see https://docs.nestjs.com/techniques/logger
 * @example
 * const logger = new LoggerService();
 * logger.log('Application started');
 * logger.error('An error occurred');
 */
@Injectable()
export class LoggerService extends ConsoleLogger {
  /**
   * Creates a new LoggerService instance.
   * @param options Logger context or ConsoleLoggerOptions.
   */
  constructor(options: string | ConsoleLoggerOptions = "LoggerService") {
    if (typeof options === "string") {
      super(options);
    } else {
      super(options);
    }
  }

  /**
   * Logs a message at 'info' level.
   * @param message The message to log.
   * @param optionalParams Additional parameters.
   * @example
   * logger.log('Server started');
   */
  log(message: any, ...optionalParams: any[]) {
    super.log(message, ...optionalParams);
    fileLogger.info(typeof message === "string" ? message : JSON.stringify(message));
  }

  /**
   * Logs a message at 'error' level.
   * @param message The error message.
   * @param optionalParams Additional parameters.
   * @example
   * logger.error('Database connection failed');
   */
  error(message: any, ...optionalParams: any[]) {
    super.error(message, ...optionalParams);
    fileLogger.error(typeof message === "string" ? message : JSON.stringify(message));
  }

  /**
   * Logs a message at 'warn' level.
   * @param message The warning message.
   * @param optionalParams Additional parameters.
   * @example
   * logger.warn('Low disk space');
   */
  warn(message: any, ...optionalParams: any[]) {
    super.warn(message, ...optionalParams);
    fileLogger.warn(typeof message === "string" ? message : JSON.stringify(message));
  }

  /**
   * Logs a message at 'debug' level.
   * @param message The debug message.
   * @param optionalParams Additional parameters.
   * @example
   * logger.debug('Debugging variable x:', x);
   */
  debug(message: any, ...optionalParams: any[]) {
    super.debug?.(message, ...optionalParams);
    fileLogger.debug(typeof message === "string" ? message : JSON.stringify(message));
  }
}

/**
 * For more information:
 * - Winston: https://github.com/winstonjs/winston
 * - NestJS Logger: https://docs.nestjs.com/techniques/logger
 * - Node.js process events: https://nodejs.org/api/process.html
 */
