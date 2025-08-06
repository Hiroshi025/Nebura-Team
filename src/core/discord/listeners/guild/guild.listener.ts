import { SkipLogging } from "#common/decorators/logging.decorator";
import { Context, ContextOf, On } from "necord";

import { Injectable } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";

/**
 * ClientListener service to handle Discord client events.
 *
 * This service listens for the 'ready' event to log the bot's username and ID,
 * and sets the bot's activity based on configuration.
 *
 * @see {@link https://docs.necord.dev Necord Documentation}
 */
@SkipThrottle()
@SkipLogging()
@Injectable()
export class GuildListener {
  //private readonly logger = new Logger(GuildListener.name);
  constructor() {}

  @On("interactionCreate")
  public onInteractionCreate(@Context() [interaction]: ContextOf<"interactionCreate">) {
    if (!interaction.guild || interaction.user.bot || !interaction.channel) return;
    if (!interaction.isChatInputCommand()) return;
  }
}
