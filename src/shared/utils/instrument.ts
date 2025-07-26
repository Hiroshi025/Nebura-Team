/**
 * @module SentryInstrumentation
 *
 * This module initializes Sentry error tracking and performance profiling for the application.
 *
 * Sentry is a platform for monitoring application errors and performance issues.
 * This setup uses the official Sentry Node.js SDK and the profiling integration.
 *
 * @see {@link https://docs.sentry.io/platforms/node/}
 * @see {@link https://docs.sentry.io/platforms/node/profiling/}
 *
 * ## Example
 *
 * ```typescript
 * import "./shared/instrument";
 * // Your application code here
 * ```
 *
 * With this module imported, all uncaught exceptions and performance traces will be sent to Sentry.
 */

import { loadEnvFile } from "process";

import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

/**
 * Initializes Sentry with the provided configuration.
 *
 * - `dsn`: The Sentry Data Source Name. Must be set in the environment variable `SENTRY_DNS`.
 * - `debug`: Enables debug mode for verbose logging.
 * - `tracesSampleRate`: Sets the percentage of transactions to capture for performance monitoring (1 = 100%).
 * - `profilesSampleRate`: Sets the percentage of transactions to capture for profiling (1 = 100%).
 * - `integrations`: Adds the Node.js profiling integration.
 *
 * @example
 * // To enable Sentry, set the environment variable:
 * // SENTRY_DNS=https://<key>@sentry.io/<project>
 *
 * import "./shared/instrument";
 *
 * // Now Sentry will capture errors and performance data.
 */
loadEnvFile();
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  debug: false,
  tracesSampleRate: 1,
  profilesSampleRate: 1, // Set profiling sampling rate.
  integrations: [nodeProfilingIntegration()],
});
