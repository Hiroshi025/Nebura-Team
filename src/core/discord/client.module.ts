import { UserEntity } from "#entity/users/user.entity";
import { LicenseEntity } from "#entity/utils/licence.entity";
import { ButtonStyle, IntentsBitField, Options, Partials, PresenceStatusData } from "discord.js";
/* eslint-disable @typescript-eslint/require-await */
import { NecordModule } from "necord";

import { NecordPaginationModule } from "@necord/pagination";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ContextInteraction } from "./interactions/components/context.interaction";
import { ModalInteraction } from "./interactions/components/modals.interaction";
import { InteractionHandler } from "./interactions/interaction";
import { MessageInteraction } from "./interactions/message.interaction";
import { ClientListener } from "./listeners/client.listener";
import { GuildListener } from "./listeners/guild.listener";

/**
 * The DiscordModule is responsible for integrating the Necord Discord client
 * into the NestJS application. It sets up the Discord bot using Necord and
 * provides listeners for Discord events.
 *
 * @remarks
 * This module imports the NecordModule and configures it using a custom
 * NecordClient configuration. It also provides the {@link ClientListener} listener
 * for handling Discord client events.
 *
 * @example
 * ```typescript
 * import { DiscordModule } from './core/discord/client.module';
 *
 * @Module({
 *   imports: [DiscordModule],
 * })
 * export class AppModule {}
 * ```
 *
 * @see {@link https://necord.dev/ Necord Documentation}
 * @see {@link https://docs.nestjs.com/modules NestJS Modules}
 *
 * @public
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, LicenseEntity]),
    ConfigModule.forRoot(),
    NecordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        token: configService.get<string>("DISCORD_TOKEN", ""),
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
        development: [configService.get<string>("DISCORD_DEVELOPMENT_GUILD_ID", "")],
        prefix: configService.get<string>("DISCORD_PREFIX", ""),
        skipRegistration: false,
        presence: {
          status: configService.get<string>("DISCORD_PRESENCE_STATUS", "") as PresenceStatusData,
          activities: [
            {
              name: configService.get<string>("DISCORD_ACTIVITY_NAME", ""),
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
      }),
      inject: [ConfigService],
    }),
    NecordPaginationModule.forRoot({
      buttons: {
        first: {
          style: ButtonStyle.Secondary,
          label: "First",
          emoji: "⏪",
        },
        next: {
          style: ButtonStyle.Secondary,
          label: "Next",
          emoji: "▶️",
        },
        back: {
          style: ButtonStyle.Secondary,
          label: "Back",
          emoji: "◀️",
        },
        last: {
          style: ButtonStyle.Secondary,
          label: "Last",
          emoji: "⏩",
        },
        traverse: {
          style: ButtonStyle.Secondary,
          label: "Traverse",
          emoji: "🔄",
        },
      },
      allowSkip: true,
      allowTraversal: true,
      buttonsPosition: "end",
    }),
  ],
  providers: [ClientListener, MessageInteraction, InteractionHandler, GuildListener, ContextInteraction, ModalInteraction],
  exports: [NecordModule],
})
export class DiscordModule {}
