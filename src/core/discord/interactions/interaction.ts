/* eslint-disable @typescript-eslint/no-unsafe-call */
import { SkipLogging } from "#common/decorators/logging.decorator";
import { UserRole } from "#common/typeRole";
import { UserEntity } from "#entity/users/user.entity";
import {
	ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedData, PermissionFlagsBits
} from "discord.js";
import { Context, Options, SlashCommand, SlashCommandContext } from "necord";
import { Repository } from "typeorm";

import { NecordPaginationService, PageBuilder, PaginationBuilder } from "@necord/pagination";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SkipThrottle } from "@nestjs/throttler";
import { InjectRepository } from "@nestjs/typeorm";

import { TextDto } from "./dto/email-request.dto";

/**
 * InteractionHandler class to manage Discord interactions.
 *
 * This class handles specific interactions such as the ping command.
 * It uses the @SlashCommand decorator to define a slash command that can be invoked in Discord.
 */
@SkipThrottle()
@SkipLogging()
@Injectable()
export class InteractionHandler {
  private readonly logger = new Logger(InteractionHandler.name);
  constructor(
    @InjectRepository(UserEntity)
    private readonly authRepository: Repository<UserEntity>,
    private readonly configService: ConfigService,
    private readonly paginationService: NecordPaginationService,
  ) {}
  /**
   * Presents Nebura project information in an embed with buttons.
   *
   * @param interaction - The interaction context.
   * @returns An embed with project details and action buttons.
   *
   * Example usage: /about
   */
  @SlashCommand({
    name: "about",
    description: "Show information about the project.",
    defaultMemberPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.EmbedLinks],
  })
  public async onAbout(@Context() [interaction]: SlashCommandContext) {
    const embed = {
      title: "Project Control",
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

    return interaction.reply({ embeds: [embed], components: [row] });
  }

  /**
   * Command to link your Discord account with your registered project account.
   * Requests your email and saves Discord information to your project account.
   */
  @SlashCommand({
    name: "link",
    description: "Link your Discord account with your registered project account using your email.",
    guilds: [process.env.DISCORD_DEVELOPMENT_GUILD_ID as string],
    defaultMemberPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.EmbedLinks],
  })
  public async linkAccount(@Context() [interaction]: SlashCommandContext, @Options() dto: TextDto) {
    const email = dto.email;
    const user = await this.authRepository.findOne({ where: { email } });

    if (!user) {
      const embed = {
        title: "Account Linking Failed",
        description: "No account registered with that email was found.",
        color: 0xff0000,
      };
      return interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }

    const discordUser = interaction.user;
    const discordInfo = {
      id: discordUser.id,
      username: discordUser.username,
      global_name: discordUser.globalName ?? null,
      discriminator: discordUser.discriminator,
      avatar: discordUser.avatarURL?.() ?? "https://cdn.discordapp.com/embed/avatars/0.png",
    };

    user.discordInfo = discordInfo;
    if (this.configService.get<string[]>("owners")?.includes(discordUser.id)) {
      this.logger.fatal(`User ${discordUser.username} (${discordUser.id}) linked their Discord account.`);
      user.role = UserRole.DEVELOPER;
    }

    await this.authRepository.save(user);
    return interaction.reply({
      embeds: [
        {
          title: "Account Linked Successfully",
          description: "Your Discord account has been successfully linked to your project account!",
          fields: [
            { name: "Email", value: email, inline: true },
            { name: "Discord Username", value: discordUser.username, inline: true },
          ],
          color: 0x57f287,
          thumbnail: { url: discordUser.avatarURL?.() ?? "https://cdn.discordapp.com/embed/avatars/0.png" },
        },
      ],
      flags: "Ephemeral",
    });
  }

  /**
   * Command to show all user licenses with pagination.
   */
  @SlashCommand({
    name: "licenses",
    description: "Show all your licenses registered in the system.",
    defaultMemberPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.EmbedLinks],
  })
  public async showLicenses(@Context() [interaction]: SlashCommandContext) {
    const discordUser = interaction.user;
    const user = await this.authRepository
      .createQueryBuilder("user")
      .where(`"user"."discordInfo"->>'id' = :id`, { id: discordUser.id })
      .andWhere(`"user"."deletedAt" IS NULL`)
      .getOne();

    if (!user) {
      return interaction.reply({
        embeds: [
          {
            title: "Licenses not found",
            description: "No profile linked to your Discord account was found.",
            color: 0xff0000,
          },
        ],
        flags: "Ephemeral",
      });
    }

    const licenses = user.licenses ?? [];
    if (licenses.length === 0) {
      return interaction.reply({
        embeds: [
          {
            title: "No licenses",
            description: "You have no licenses registered in your account.",
            color: 0xff0000,
          },
        ],
        flags: "Ephemeral",
      });
    }

    const embeds: EmbedData[] = licenses.map((lic, idx) => ({
      title: `🔑 License #${idx + 1} • ${lic.type === "premium" ? "🌟 Premium" : lic.type === "basic" ? "🔹 Basic" : "🏢 Enterprise"}`,
      description: [
        `**ID:** \`${lic.id}\``,
        `**Key:** \`${lic.key}\``,
        `**Type:** \`${lic.type}\``,
        `**Created:** <t:${Math.floor(new Date(lic.createdAt).getTime() / 1000)}:f>`,
        `**Expires:** <t:${Math.floor(new Date(lic.validUntil).getTime() / 1000)}:R>`,
        `**Max IPs:** \`${lic.maxIps ?? "N/A"}\``,
        `**Request limit:** \`${lic.requestLimit ?? "N/A"}\``,
        `**Requests used:** \`${lic.requestCount ?? 0}\``,
        `**Identifier:** \`${lic.identifier ?? "N/A"}\``,
      ].join("\n"),
      color: lic.type === "premium" ? 0xf1c40f : lic.type === "basic" ? 0x3498db : 0x8e44ad,
      fields: [
        {
          name: "Ips List",
          value:
            lic.ips && lic.ips.length ? lic.ips.map((ip: any, index: number) => `No.${index + 1} \`${ip}\``).join("\n") : "N/A",
        },
        {
          name: "Hwid List",
          value:
            lic.hwid && lic.hwid.length ? lic.hwid.map((h: any, index: number) => `No.${index + 1} \`${h}\``).join("\n") : "N/A",
        },
      ],
      footer: { text: `License ${idx + 1} of ${licenses.length}` },
      timestamp: lic.createdAt,
    }));

    const paginatedMessage = this.paginationService.register((builder: PaginationBuilder) => {
      return builder
        .setCustomId("licenses-pagination")
        .setPages([
          ...embeds.map((embed) => {
            return new PageBuilder().addEmbed(embed);
          }),
        ])
        .setPagesFactory((page) => {
          return new PageBuilder().setContent(`Page ${page + 1} of ${embeds.length}`);
        });
    });

    const page = await paginatedMessage.build();
    return interaction.reply(page);
  }

  /**
   * Command to show the user's profile information.
   */
  @SlashCommand({
    name: "profile",
    description: "Show your linked profile information.",
    defaultMemberPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.EmbedLinks],
  })
  public async showProfile(@Context() [interaction]: SlashCommandContext) {
    const discordUser = interaction.user;
    const user = await this.authRepository
      .createQueryBuilder("user")
      .where(`"user"."discordInfo"->>'id' = :id`, { id: discordUser.id })
      .andWhere(`"user"."deletedAt" IS NULL`)
      .getOne();

    if (!user) {
      return interaction.reply({
        embeds: [
          {
            title: "❌ Profile Not Linked",
            description: "No profile linked to your Discord account was found.\n\nUse `/link` to connect your account.",
            color: 0xe74c3c,
            thumbnail: { url: "https://cdn.discordapp.com/embed/avatars/0.png" },
            footer: { text: "Nebura System" },
          },
        ],
        flags: "Ephemeral",
      });
    }

    const embed = {
      title: "👤 User Profile",
      description: "Your linked account details are shown below.",
      color: 0x2ecc71,
      thumbnail: { url: discordUser.avatarURL?.() ?? "https://cdn.discordapp.com/embed/avatars/0.png" },
      fields: [
        { name: "Full Name", value: `\`${user.name}\``, inline: true },
        { name: "Email", value: `\`${user.email}\``, inline: true },
        { name: "Role", value: `\`${user.role}\``, inline: true },
        { name: "UUID", value: `\`${user.uuid}\``, inline: false },
        { name: "Discord Username", value: `\`${user.discordInfo?.username ?? "N/A"}\``, inline: true },
        { name: "Discord ID", value: `\`${user.discordInfo?.id ?? "N/A"}\``, inline: true },
      ],
      footer: { text: `Requested by ${discordUser.username} • Nebura System` },
      timestamp: new Date().toISOString(),
    };

    return interaction.reply({
      embeds: [embed],
      flags: "Ephemeral",
    });
  }

  /**
   * Command to show the user's QR code if Discord is linked to an account.
   */
  @SlashCommand({
    name: "userqr",
    description: "Show your QR code if your Discord account is linked.",
    defaultMemberPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.EmbedLinks],
  })
  public async showUserQr(@Context() [interaction]: SlashCommandContext) {
    const discordUser = interaction.user;
    const user = await this.authRepository
      .createQueryBuilder("user")
      .where(`"user"."discordInfo"->>'id' = :id`, { id: discordUser.id })
      .andWhere(`"user"."deletedAt" IS NULL`)
      .getOne();

    if (!user) {
      return interaction.reply({
        embeds: [
          {
            title: "❌ Account Not Linked",
            description: "No profile linked to your Discord account was found.\n\nUse `/link` to connect your account.",
            color: 0xe74c3c,
            thumbnail: { url: "https://cdn.discordapp.com/embed/avatars/0.png" },
            footer: { text: "Nebura System" },
          },
        ],
        flags: "Ephemeral",
      });
    }

    if (!user.qrCodeBase64) {
      return interaction.reply({
        embeds: [
          {
            title: "⚠️ QR Code Not Found",
            description: "No QR code is registered for your account.",
            color: 0xf39c12,
            thumbnail: { url: discordUser.avatarURL?.() ?? "https://cdn.discordapp.com/embed/avatars/0.png" },
            footer: { text: "Nebura System" },
          },
        ],
        flags: "Ephemeral",
      });
    }

    const matches = user.qrCodeBase64.match(/^data:image\/png;base64,(.+)$/);
    if (!matches) {
      return interaction.reply({
        embeds: [
          {
            title: "❗ QR Code Error",
            description: "Failed to decode the QR code image. Please contact support.",
            color: 0xe74c3c,
            thumbnail: { url: discordUser.avatarURL?.() ?? "https://cdn.discordapp.com/embed/avatars/0.png" },
            footer: { text: "Nebura System" },
          },
        ],
        flags: "Ephemeral",
      });
    }

    const qrBuffer = Buffer.from(matches[1], "base64");
    const qrAttachment = { attachment: qrBuffer, name: "user-qr.png" };

    return await interaction.reply({
      embeds: [
        {
          author: {
            name: `${user.name} (${user.uuid})`,
            icon_url: user.discordInfo?.avatar ?? "https://cdn.discordapp.com/embed/avatars/0.png",
          },
          title: "🔒 Your QR Code",
          description: "This is your personal QR code. Keep it safe and do not share it with anyone.",
          image: { url: "attachment://user-qr.png" },
          fields: [
            {
              name: "Account Info",
              value: [
                `**Name:** \`${user.name}\``,
                `**Email:** \`${user.email}\``,
                `**Role:** \`${user.role}\``,
                `**UUID:** \`${user.uuid}\``,
                `**Discord ID:** \`${user.discordInfo?.id ?? "N/A"}\``,
              ].join("\n"),
              inline: false,
            },
          ],
          color: 0x1abc9c,
          footer: { text: `Requested by ${discordUser.username} • Nebura System` },
          timestamp: new Date().toISOString(),
        },
      ],
      files: [qrAttachment],
      flags: "Ephemeral",
    });
  }
}
