/* eslint-disable @typescript-eslint/restrict-template-expressions */
import "winston-daily-rotate-file";

import { createLogger, format, transports } from "winston";

import { ConsoleLogger, ConsoleLoggerOptions, Injectable } from "@nestjs/common";

// Configura el nivel de log por entorno
const logLevel = process.env.LOG_LEVEL || "info";

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

// Manejo de excepciones y rechazos no manejados
fileLogger.exceptions.handle(
  new transports.DailyRotateFile({
    filename: "logs/exceptions-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: false,
    maxSize: "20m",
    maxFiles: "14d",
  }),
);

process.on("unhandledRejection", (reason: any) => {
  fileLogger.error(`Unhandled Rejection: ${typeof reason === "string" ? reason : JSON.stringify(reason)}`);
});

@Injectable()
export class LoggerService extends ConsoleLogger {
  constructor(options: string | ConsoleLoggerOptions = "LoggerService") {
    if (typeof options === "string") {
      super(options);
    } else {
      super(options);
    }
  }

  log(message: any, ...optionalParams: any[]) {
    super.log(message, ...optionalParams);
    fileLogger.info(typeof message === "string" ? message : JSON.stringify(message));
  }

  error(message: any, ...optionalParams: any[]) {
    super.error(message, ...optionalParams);
    fileLogger.error(typeof message === "string" ? message : JSON.stringify(message));
  }

  warn(message: any, ...optionalParams: any[]) {
    super.warn(message, ...optionalParams);
    fileLogger.warn(typeof message === "string" ? message : JSON.stringify(message));
  }

  debug(message: any, ...optionalParams: any[]) {
    super.debug?.(message, ...optionalParams);
    fileLogger.debug(typeof message === "string" ? message : JSON.stringify(message));
  }
}
