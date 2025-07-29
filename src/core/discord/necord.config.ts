import { IntentsBitField, Options, Partials, PresenceStatusData } from "discord.js";
import { NecordModuleOptions } from "necord";

import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/**
 * Necord client configuration for the Discord bot.
 *
 * This class initializes the Necord client with the provided configuration.
 * It sets up the necessary options for connecting to Discord, including intents,
 * partials, and presence settings.
 *
 * @see {@link https://docs.nestjs.com/recipes/necord Necord Documentation}
 * @see {@link https://docs.nestjs.com/recipes/necord#configuration Necord Configuration}
 */
export class NecordClient {
  private readonly logger = new Logger(NecordClient.name);
  private readonly config: ConfigService;
  constructor() {
    this.config = new ConfigService();
    this.logger.log("Initializing Necord client with configuration");
    this.logger.debug(`Token: ${this.config.get<string>("DISCORD_TOKEN")}`);
  }

  /**
   * Returns the Necord configuration.
   * @returns {NecordModuleOptions} The Necord configuration.
   */
  public getConfig(): NecordModuleOptions {
    return {
      token: process.env.DISCORD_TOKEN ? String(process.env.DISCORD_TOKEN) : "",
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildPresences,
        IntentsBitField.Flags.GuildVoiceStates,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildExpressions,
      ],
      partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.Reaction,
        Partials.User,
        Partials.ThreadMember,
      ],
      development: [process.env.DISCORD_DEVELOPMENT_GUILD_ID ? String(process.env.DISCORD_DEVELOPMENT_GUILD_ID) : ""],
      prefix: process.env.DISCORD_PREFIX,
      skipRegistration: false,
      presence: {
        status: process.env.DISCORD_PRESENCE_STATUS as PresenceStatusData,
        activities: [
          {
            name: process.env.DISCORD_ACTIVITY_NAME as string,
          },
        ],
      },
      sweepers: {
        ...Options.DefaultSweeperSettings,
        users: {
          interval: 1_800, // Every hour.
          filter: () => (user) => user.bot && user.id !== user.client.user.id, // Remove all bots except self.
        },
        threads: {
          interval: 1_800, // Every 30 minutes.
          lifetime: 86_400, // Remove threads older than 24 hours.
        },
      },
    };
  }
}
