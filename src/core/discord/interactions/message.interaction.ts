import { SkipLogging } from "#common/decorators/logging.decorator";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } from "discord.js";
import { Arguments, Context, TextCommand, TextCommandContext } from "necord";

/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";

import {
	handleRepository, handleSearch, handleUser, showMainMenu, showQuickLookup
} from "../lib/functions";

/**
 * MessageInteraction class to handle text commands in Discord.
 *
 * This class defines a text command that can be invoked in Discord messages.
 */
@SkipThrottle()
@SkipLogging()
@Injectable()
export class MessageInteraction {
  constructor() {}
  /**
   * Presents the Nebura project information in an embed with buttons.
   *
   * Usage: !about
   */
  @SkipLogging()
  @TextCommand({ name: "about", description: "Show information about the project." })
  public async onAbout(@Context() [message]: TextCommandContext, @Arguments() _args: string[]) {
    const embed = {
      title: "Proyect Control",
      description:
        "A modular, extensible, and robust API platform integrating Discord, WhatsApp, GitHub, Google Gemini AI, and more.\n\nBuilt in TypeScript for scalability and maintainability.",
      thumbnail: { url: "https://i.pinimg.com/1200x/58/08/35/5808355cb825f18671975d00cbe10870.jpg" },
      fields: [
        { name: "Version", value: "1.0.0", inline: true },
        { name: "License", value: "MIT", inline: true },
        { name: "Author", value: "[Hiroshi025](https://github.com/Hiroshi025)", inline: true },
      ],
      color: 0x5865f2,
    };

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setLabel("GitHub").setStyle(ButtonStyle.Link).setURL("https://github.com/Hiroshi025"),
    );

    return message.reply({ embeds: [embed], components: [row] });
  }

  @TextCommand({ name: "dns", description: "Show information about the DNS." })
  public async onDns(@Context() [message]: TextCommandContext, @Arguments() args: string[]) {
    try {
      if (!message.guild) return;
      if (!args.length) {
        return showMainMenu(message, process.env.DISCORD_PREFIX as string);
      }

      const domain = args[0].replace(/^https?:\/\//, "").split("/")[0];
      return showQuickLookup(message, domain);
    } catch (e: any) {
      return message.reply({
        embeds: [
          {
            color: 0xff0000,
            title: "Error",
            description: [
              "An error occurred while processing your request.",
              "Please try again later or contact support if the issue persists.",
            ].join("\n"),
          },
        ],
      });
    }
  }

  @TextCommand({ name: "github", description: "Search GitHub profiles and repositories" })
  public async onGithub(@Context() [message]: TextCommandContext, @Arguments() args: string[]) {
    if (!message.guild || !message.channel || message.channel.type !== ChannelType.GuildText) return;

    if (!args[0]) {
      return message.reply({
        embeds: [
          {
            color: 0xff0000,
            title: "Error",
            description: [
              "Please provide a GitHub username, repository, or search query.",
              `Usage: \`${process.env.DISCORD_PREFIX}github <username/repo/search>\``,
              "Examples:",
              `\`${process.env.DISCORD_PREFIX}github octocat\` - Look up user 'octocat'`,
              `\`${process.env.DISCORD_PREFIX}github octocat/Hello-World\` - Look up repository 'Hello-World' of user 'octocat'`,
              `\`${process.env.DISCORD_PREFIX}github search <query>\` - Search GitHub for '<query>'`,
            ].join("\n"),
          },
        ],
      });
    }

    if (args[0].includes("/") && args.length === 1) {
      return await handleRepository(message, args[0]);
    }

    if (args[0].toLowerCase() === "search") {
      const query = args.slice(1).join(" ");
      return await handleSearch(message, query);
    }
    
    return await handleUser(message, args[0]);
  }
}