import chalk from "chalk";

import { Injectable, Scope } from "@nestjs/common";

/**
 * Supported log levels, aligned with NestJS standards.
 * @see https://docs.nestjs.com/techniques/logger
 */
type LogLevel = "error" | "warn" | "log" | "debug" | "verbose";

/**
 * Colors assigned to each log level.
 * Uses Chalk for color formatting in the console.
 * @see https://github.com/chalk/chalk
 */
const levelColors: Record<LogLevel, chalk.Chalk> = {
  error: chalk.red,
  warn: chalk.yellow,
  log: chalk.green,
  debug: chalk.magenta,
  verbose: chalk.cyan,
};

/**
 * Formatted names for each log level.
 */
const levelLabels: Record<LogLevel, string> = {
  error: "ERROR",
  warn: "WARN",
  log: "LOG",
  debug: "DEBUG",
  verbose: "VERBOSE",
};

/**
 * Logger provides colored and contextual logging for console output.
 * It supports all NestJS log levels and allows setting a context for each log message.
 *
 * @example
 * ```ts
 * const logger = new Logger();
 * logger.setContext('MyService');
 * logger.log('Service started');
 * logger.error('An error occurred', error);
 * ```
 *
 * @see https://docs.nestjs.com/techniques/logger
 */
@Injectable({ scope: Scope.TRANSIENT })
export class Logger {
  /**
   * Optional context string for log messages.
   * Displayed in yellow before the message if set.
   */
  private context?: string;

  /**
   * Sets the logger context, which is displayed in each log message.
   * Useful for identifying the source of logs.
   *
   * @param context - The context name to display.
   */
  setContext(context: string) {
    this.context = context;
  }

  /**
   * Formats the log message for console output.
   * Adds timestamp, log level, context, and optional parameters.
   *
   * @param level - The log level.
   * @param message - The main log message.
   * @param optionalParams - Additional parameters to log.
   * @returns The formatted string for console output.
   */
  private formatMessage(level: LogLevel, message: string, ...optionalParams: unknown[]) {
    const color = levelColors[level];
    const timestamp = new Date().toISOString();
    const contextStr = this.context ? chalk.yellow(`[${this.context}] `) : "";

    const formattedLevel = color(levelLabels[level].padEnd(7));
    const formattedMessage = `${chalk.gray(timestamp)} ${formattedLevel} ${contextStr}${message}`;

    if (optionalParams.length > 0) {
      return `${formattedMessage} ${chalk.gray(JSON.stringify(optionalParams))}`;
    }
    return formattedMessage;
  }

  /**
   * Logs an error-level message to the console.
   *
   * @param message - The error message.
   * @param optionalParams - Additional parameters to log.
   */
  error(message: string, ...optionalParams: unknown[]) {
    console.error(this.formatMessage("error", message, ...optionalParams));
  }

  /**
   * Logs a warning-level message to the console.
   *
   * @param message - The warning message.
   * @param optionalParams - Additional parameters to log.
   */
  warn(message: string, ...optionalParams: unknown[]) {
    console.warn(this.formatMessage("warn", message, ...optionalParams));
  }

  /**
   * Logs an info-level message to the console.
   *
   * @param message - The info message.
   * @param optionalParams - Additional parameters to log.
   */
  log(message: string, ...optionalParams: unknown[]) {
    console.log(this.formatMessage("log", message, ...optionalParams));
  }

  /**
   * Logs a debug-level message to the console.
   *
   * @param message - The debug message.
   * @param optionalParams - Additional parameters to log.
   */
  debug(message: string, ...optionalParams: unknown[]) {
    console.debug(this.formatMessage("debug", message, ...optionalParams));
  }

  /**
   * Logs a verbose-level message to the console.
   *
   * @param message - The verbose message.
   * @param optionalParams - Additional parameters to log.
   */
  verbose(message: string, ...optionalParams: unknown[]) {
    console.log(this.formatMessage("verbose", message, ...optionalParams));
  }
}
