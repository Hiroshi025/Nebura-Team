/* eslint-disable @typescript-eslint/no-unsafe-call */

/**
 * Represents CPU usage times for a single core.
 * @see {@link https://nodejs.org/api/os.html#oscpus}
 */
export interface CPUUsage {
  /** Time spent in user mode (ms) */
  user: number;
  /** Time spent in nice mode (ms) */
  nice: number;
  /** Time spent in system mode (ms) */
  sys: number;
  /** Time spent idle (ms) */
  idle: number;
  /** Time spent servicing interrupts (ms) */
  irq: number;
}

/**
 * Represents a CPU core's information.
 * @see {@link https://nodejs.org/api/os.html#oscpus}
 */
export interface CPUCore {
  /** Core index */
  core: number;
  /** CPU model name */
  model: string;
  /** CPU speed in MHz */
  speed: number;
  /** Usage times for this core */
  times: CPUUsage;
}

/**
 * Collection of helper functions for formatting and calculations.
 * @remarks
 * These helpers are used for formatting bytes, percentages, times, dates, and determining status classes.
 * They can be registered as Handlebars helpers using {@link registerHelpers}.
 */
export const helpers = {
  /**
   * Formats bytes into a human-readable string (KB, MB, GB, etc).
   * @param bytes - Number of bytes to format.
   * @param decimals - Number of decimal places to display (default: 2).
   * @returns Formatted string (e.g., `"1.25 MB"`).
   * @example
   * ```ts
   * helpers.formatBytes(1024); // "1 KB"
   * helpers.formatBytes(1048576, 1); // "1.0 MB"
   * ```
   * @see {@link https://stackoverflow.com/a/18650828}
   */
  formatBytes: (bytes: number, decimals: number = 2): string => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  },

  /**
   * Formats a number to 2 decimal places.
   * @param value - Number to format.
   * @returns String with 2 decimal places (e.g., `"123.45"`).
   * @example
   * ```ts
   * helpers.toFixed2(123.456); // "123.46"
   * helpers.toFixed2(123); // "123.00"
   * ```
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed}
   * @see {@link https://stackoverflow.com/a/1757393}
   */
  toFixed2: (value: number): string => {
    return Number(value).toFixed(2);
  },

  /**
   * Calculates the percentage between a value and a total.
   * @param value - Current value.
   * @param total - Maximum value.
   * @returns Percentage as a string with 2 decimals (e.g., `"75.50"`).
   * @example
   * ```ts
   * helpers.calculatePercentage(75, 100); // "75.00"
   * helpers.calculatePercentage(30, 60); // "50.00"
   * ```
   */
  calculatePercentage: (value: number, total: number): string => {
    if (total === 0) return "0";
    return ((value / total) * 100).toFixed(2);
  },

  /**
   * Formats milliseconds into a readable time format (h, m, s).
   * @param ms - Time in milliseconds.
   * @returns Formatted string (e.g., `"1h 30m"`, `"45s"`).
   * @example
   * ```ts
   * helpers.formatMs(3600000); // "1h 0m"
   * helpers.formatMs(45000); // "45s"
   * ```
   */
  formatMs: (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  },

  /**
   * Formats uptime in seconds into a readable format.
   * @param seconds - Uptime in seconds.
   * @returns Formatted string (e.g., `"2d 5h 30m"`).
   * @example
   * ```ts
   * helpers.formatUptime(90061); // "1d 1h 1m 1s"
   * helpers.formatUptime(3600); // "1h 0m 0s"
   * ```
   */
  formatUptime: (seconds: number): string => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const result: string[] = [];
    if (days > 0) result.push(`${days}d`);
    if (hours > 0) result.push(`${hours}h`);
    if (mins > 0) result.push(`${mins}m`);
    if (secs > 0 || result.length === 0) result.push(`${secs}s`);

    return result.join(" ");
  },

  /**
   * Formats a date object or string into a readable date string.
   * @param date - Date object or date string.
   * @returns Formatted date string (e.g., `"Jan 1, 2023, 12:30:45 PM"`).
   * @example
   * ```ts
   * helpers.formatDate(new Date());
   * helpers.formatDate("2023-01-01T12:30:45Z");
   * ```
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString}
   */
  formatDate: (date: Date | string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return new Date(date).toLocaleDateString(undefined, options);
  },

  /**
   * Determines the CSS class for memory status based on usage.
   * @param used - Used memory.
   * @param total - Total memory.
   * @returns CSS class (`"error"`, `"warning"`, or `"healthy"`).
   * @example
   * ```ts
   * helpers.getMemoryStatusClass(950, 1000); // "error"
   * helpers.getMemoryStatusClass(800, 1000); // "warning"
   * helpers.getMemoryStatusClass(500, 1000); // "healthy"
   * ```
   */
  getMemoryStatusClass: (used: number, total: number): string => {
    const percentage = (used / total) * 100;
    if (percentage > 90) return "error";
    if (percentage > 75) return "warning";
    return "healthy";
  },

  /**
   * Determines the CSS class for CPU status based on usage percentage.
   * @param percent - CPU usage percentage.
   * @returns CSS class (`"error"`, `"warning"`, or `"healthy"`).
   * @example
   * ```ts
   * helpers.getCPUStatusClass(95); // "error"
   * helpers.getCPUStatusClass(80); // "warning"
   * helpers.getCPUStatusClass(50); // "healthy"
   * ```
   */
  getCPUStatusClass: (percent: number): string => {
    if (percent > 90) return "error";
    if (percent > 70) return "warning";
    return "healthy";
  },

  /**
   * Sums all CPU times for a core.
   * @param times - Object containing CPU times.
   * @returns Total sum of all times.
   * @example
   * ```ts
   * helpers.sumTimes({user: 100, nice: 10, sys: 50, idle: 200, irq: 5}); // 365
   * ```
   */
  sumTimes: (times: CPUUsage): number => {
    return times.user + times.nice + times.sys + times.idle + times.irq;
  },

  /**
   * Handlebars helper for equality comparison.
   * @param arg1 - First value to compare.
   * @param arg2 - Second value to compare.
   * @param options - Handlebars options object.
   * @returns Rendered block if equal, else inverse block.
   * @example
   * ```handlebars
   * {{#ifEquals value1 value2}}
   *   <!-- Rendered if value1 == value2 -->
   * {{else}}
   *   <!-- Rendered if not equal -->
   * {{/ifEquals}}
   * ```
   * @see {@link https://handlebarsjs.com/guide/block-helpers.html}
   */
  ifEquals: function (arg1: any, arg2: any, options: any): any {
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
  },
};

/**
 * Registers all helpers in a Handlebars instance.
 * @param hbs - Handlebars instance.
 * @example
 * ```ts
 * import Handlebars from "handlebars";
 * import { registerHelpers } from "./helpers";
 * registerHelpers(Handlebars);
 * ```
 * @see {@link https://handlebarsjs.com/api-reference/runtime.html#handlebarsregisterhelper-name-helper}
 */
export function registerHelpers(hbs: any): void {
  for (const [name, fn] of Object.entries(helpers)) {
    hbs.registerHelper(name, fn);
  }
}
