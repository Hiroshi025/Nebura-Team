/**
 * # Lavalink Player Manager Service
 *
 * Handles Lavalink player lifecycle events such as creation and destruction.
 *
 * ## Events Handled
 * - `playerCreate`: Triggered when a Lavalink player is created for a guild.
 * - `playerDestroy`: Triggered when a Lavalink player is destroyed for a guild.
 *
 * ## Documentation
 * - [Lavalink Documentation](https://github.com/freyacodes/Lavalink)
 * - [Necord Lavalink Docs](https://necord.dev/docs/lavalink)
 *
 * ## Usage Example
 * ```typescript
 * // This service is automatically used by Necord/Lavalink for player event handling.
 * ```
 */

import { Context } from "necord";

import { LavalinkManagerContextOf, OnLavalinkManager } from "@necord/lavalink";
import { Injectable, Logger } from "@nestjs/common";

/**
 * lavalinkService class to handle Lavalink player events.
 * Logs player creation and destruction for monitoring player status.
 */
@Injectable()
export class lavalinkService {
  private readonly logger = new Logger(lavalinkService.name);

  /**
   * Called when a Lavalink player is created.
   * Logs the guild ID and voice channel ID.
   * @param player LavalinkManagerContextOf<"playerCreate">
   */
  @OnLavalinkManager("playerCreate")
  public onPlayerCreate(@Context() [player]: LavalinkManagerContextOf<"playerCreate">) {
    this.logger.debug([`Lavalink player created: ${player.guildId} (${player.voiceChannelId})`].join("\n"));
  }

  /**
   * Called when a Lavalink player is destroyed.
   * Logs the guild ID and voice channel ID.
   * @param player LavalinkManagerContextOf<"playerDestroy">
   */
  @OnLavalinkManager("playerDestroy")
  public onPlayerDestroy(@Context() [player]: LavalinkManagerContextOf<"playerDestroy">) {
    this.logger.debug([`Lavalink player destroyed: ${player.guildId} (${player.voiceChannelId})`].join("\n"));
  }
}
