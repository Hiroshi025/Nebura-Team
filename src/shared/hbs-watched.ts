import chalk from "chalk";
import chokidar from "chokidar";
import { readFile } from "fs/promises";
import hbs from "hbs";
import { extname, relative } from "path";

/**
 * Logs debug messages to the console with a timestamp and colored formatting.
 *
 * @param message - The main debug message to log.
 * @param optionalParams - Additional parameters to log (will be stringified).
 *
 * @example
 * debugLog("File updated", { filename: "partial.hbs" });
 *
 * @see https://github.com/chalk/chalk
 */
function debugLog(message: string, ...optionalParams: unknown[]) {
  const timestamp = new Date().toISOString();
  const level = chalk.magenta("DEBUG".padEnd(7));
  const formatted = `${chalk.gray(timestamp)} ${level} ${message}`;
  if (optionalParams.length > 0) {
    console.debug(`${formatted} ${chalk.gray(JSON.stringify(optionalParams))}`);
  } else {
    console.debug(formatted);
  }
}

/**
 * Watches a directory for Handlebars partials (`.hbs` or `.html` files) and automatically
 * registers or updates them in the Handlebars runtime whenever they are added or changed.
 *
 * This function uses [chokidar](https://github.com/paulmillr/chokidar) for efficient file watching,
 * and [hbs](https://www.npmjs.com/package/hbs) for partial registration.
 *
 * @param partialsDir - The directory containing partial templates to watch.
 *
 * @example
 * // Register and watch all partials in the 'views/partials' directory
 * registerWatchedPartials(path.join(__dirname, "views/partials"));
 *
 * // After updating a partial file, it will be re-registered automatically.
 *
 * @see https://handlebarsjs.com/guide/partials.html
 * @see https://www.npmjs.com/package/chokidar
 */
export function registerWatchedPartials(partialsDir: string) {
  /**
   * Registers a single partial template file with Handlebars.
   *
   * @param filepath - The absolute path to the partial file.
   *
   * @internal
   */
  async function registerPartial(filepath: string) {
    const ext = extname(filepath);
    if (![".hbs", ".html"].includes(ext)) return;
    const templateName = relative(partialsDir, filepath).slice(0, -ext.length).replace(/[ -]/g, "_").replace(/\\/g, "/");
    try {
      const data = await readFile(filepath, "utf8");
      hbs.registerPartial(templateName, data);
      debugLog(`[hbs] Partial updated: ${templateName}`);
    } catch (err) {
      debugLog(`[hbs] Error registering partial: ${filepath}`, err);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  chokidar.watch(`${partialsDir}/**/*.{hbs,html}`).on("add", registerPartial).on("change", registerPartial);
}
