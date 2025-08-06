/**
 * # Lavalink Node Manager Service
 *
 * Handles Lavalink node lifecycle events such as connect, disconnect, and error.
 *
 * ## Events Handled
 * - `connect`: Triggered when a Lavalink node connects.
 * - `disconnect`: Triggered when a Lavalink node disconnects.
 * - `error`: Triggered when a Lavalink node encounters an error.
 *
 * ## Documentation
 * - [Lavalink Documentation](https://github.com/freyacodes/Lavalink)
 * - [Necord Lavalink Docs](https://necord.dev/docs/lavalink)
 *
 * ## Usage Example
 * ```typescript
 * // This service is automatically used by Necord/Lavalink for node event handling.
 * ```
 */

import { Context } from "necord";

import { NodeManagerContextOf, OnNodeManager } from "@necord/lavalink";
import { Injectable, Logger } from "@nestjs/common";

/**
 * NodeManager class to handle Lavalink node events.
 * Logs connection, disconnection, and error events for monitoring node status.
 */
@Injectable()
export class NodeManager {
  private readonly logger = new Logger(NodeManager.name);

  /**
   * Called when a Lavalink node connects.
   * Logs the session ID and server version.
   * @param node NodeManagerContextOf<"connect">
   */
  @OnNodeManager("connect")
  public onConnect(@Context() [node]: NodeManagerContextOf<"connect">) {
    this.logger.debug(
      [
        `Lavalink node connected: ${node.sessionId}`,
        `Server Version: ${node.info?.version ? JSON.stringify(node.info.version) : "unknown"}`,
      ].join("\n"),
    );
  }

  /**
   * Called when a Lavalink node disconnects.
   * Logs the session ID.
   * @param node NodeManagerContextOf<"disconnect">
   */
  @OnNodeManager("disconnect")
  public onDisconnect(@Context() [node]: NodeManagerContextOf<"disconnect">) {
    this.logger.debug(`Lavalink node disconnected: ${node.sessionId}`);
  }

  /**
   * Called when a Lavalink node encounters an error.
   * Logs the session ID and error message/stack.
   * @param node NodeManagerContextOf<"error">
   * @param error Error object
   */
  @OnNodeManager("error")
  public onError(@Context() [node, error]: NodeManagerContextOf<"error">) {
    this.logger.error(`Lavalink node error: ${node.sessionId}\n${error.message}`, error.stack);
  }
}
