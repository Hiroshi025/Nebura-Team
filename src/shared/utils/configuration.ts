import { readFileSync } from "fs";
import * as yaml from "js-yaml";

/**
 * Loads configuration from a YAML file.
 *
 * This utility reads the configuration file located at `./config/config.yml` and parses it as a JavaScript object.
 * It is commonly used for loading environment-specific settings, secrets, or application parameters.
 *
 * @returns {Record<string, any>} The parsed configuration object.
 *
 * @example
 * // config/config.yml:
 * // database:
 * //   host: localhost
 * //   port: 5432
 * //
 * // Usage:
 * import loadConfig from "./shared/utils/configuration";
 * const config = loadConfig();
 * console.log(config.database.host); // "localhost"
 *
 * @see {@link https://github.com/nodeca/js-yaml js-yaml}
 * @see {@link https://nodejs.org/api/fs.html#fs_fs_readfilesync_path_options Node.js fs.readFileSync}
 */
const YAML_CONFIG_FILENAME = "./config/config.yml";

export default () => {
  return yaml.load(readFileSync(YAML_CONFIG_FILENAME, "utf8")) as Record<string, any>;
};
