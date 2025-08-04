import { SkipLogging } from "#common/decorators/logging.decorator";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Arguments, Context, TextCommand, TextCommandContext } from "necord";

/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";

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
}
