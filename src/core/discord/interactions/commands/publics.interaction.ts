/**
 * # Public Interaction Commands
 *
 * This file contains all Discord slash commands for public user actions such as linking accounts, viewing licenses, and profile information.
 *
 * ## Commands List
 * - `/about` - Show information about the project
 * - `/link` - Link your Discord account with your registered project account using your email
 * - `/mylicences` - Show all your licenses registered in the system
 * - `/profile` - Show your linked profile information
 * - `/userqr` - Show your QR code if your Discord account is linked
 *
 * ## Documentation
 * - [Necord Documentation](https://necord.dev/)
 * - [Discord.js Documentation](https://discord.js.org/#/docs/main/stable/general/welcome)
 * - [TypeORM Documentation](https://typeorm.io/)
 *
 * ## Usage Example
 * ```bash
 * /about
 * /link email:your@email.com
 * /mylicences
 * /profile
 * /userqr
 * ```
 */

import { SkipLogging } from "#common/decorators/logging.decorator";
import { UserRole } from "#common/typeRole";
import { UserEntity } from "#entity/users/user.entity";
import {
	ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedData,
	PermissionFlagsBits
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
 * Main class for Public Discord interaction commands.
 * Provides public controls for account linking, license viewing, and profile information via Discord slash commands.
 */
@SkipThrottle()
@SkipLogging()
@Injectable()
export class PublicInteraction {
  private readonly logger = new Logger(PublicInteraction.name);
  constructor(
    @InjectRepository(UserEntity)
    private readonly authRepository: Repository<UserEntity>,
    private readonly configService: ConfigService,
    private readonly paginationService: NecordPaginationService,
  ) {}

  private async toUser(userId: string, development: boolean, interaction: ChatInputCommandInteraction) {
    const user = await this.authRepository
      .createQueryBuilder("user")
      .where(`"user"."discordInfo"->>'id' = :id`, { id: userId })
      .andWhere(`"user"."deletedAt" IS NULL`)
      .getOne();

    if (!user) {
      return interaction.reply({
        embeds: [
          {
            title: "Profile Not Found",
            description: "**Description:** No profile linked to your Discord account was found.\n\n**Example:** `/notifications`",
            color: 0xff0000,
            footer: { text: "Link your account first using /link." },
          },
        ],
        flags: "Ephemeral",
      });
    }

    if (development) {
      if (![UserRole.DEVELOPER, UserRole.OWNER].includes(user.role)) {
        return interaction.reply({
          embeds: [
            {
              title: "Permission Denied",
              description: "**Description:** Only developers and owners can use this command.\n\n**Example:** `/notifications`",
              color: 0xff0000,
              footer: { text: "Contact an admin if you need access." },
            },
          ],
          flags: "Ephemeral",
        });
      }
    }

    return user;
  }
  /**
   * Presents Nebura project information in an embed with buttons.
   *
   * @param interaction Discord interaction context.
   * @returns An embed with project details and action buttons.
   * @example
   * /about
   */
  @SkipLogging()
  @SlashCommand({
    name: "about",
    description: "Show information about the project.",
    defaultMemberPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.EmbedLinks],
  })
  public async onAbout(@Context() [interaction]: SlashCommandContext) {
    const embed = {
      title: "🛠️ Nebura Project Information",
      description: [
        "Welcome to **Nebura**!",
        "A modular, extensible, and robust API platform integrating Discord, WhatsApp, GitHub, Google Gemini AI, and more.",
        "",
        "Built in **TypeScript** for scalability and maintainability.",
        "",
        "🔗 [GitHub Repository](https://github.com/Hiroshi025)",
        "",
        "Use `/about` to see this information.",
      ].join("\n"),
      thumbnail: { url: "https://i.pinimg.com/1200x/58/08/35/5808355cb825f18671975d00cbe10870.jpg" },
      fields: [
        { name: "Version", value: "1.0.0", inline: true },
        { name: "License", value: "MIT", inline: true },
        { name: "Author", value: "[Hiroshi025](https://github.com/Hiroshi025)", inline: true },
        {
          name: "Features",
          value:
            "• Discord Integration\n• WhatsApp API\n• GitHub Automation\n• Google Gemini AI\n• License Management\n• Notifications",
          inline: false,
        },
      ],
      color: 0x5865f2,
      footer: { text: "Nebura System • All rights reserved" },
      timestamp: new Date().toISOString(),
    };

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setLabel("GitHub").setStyle(ButtonStyle.Link).setURL("https://github.com/Hiroshi025"),
    );

    return interaction.reply({ embeds: [embed], components: [row] });
  }

  /**
   * Link your Discord account with your registered project account using your email.
   * Requests your email and saves Discord information to your project account.
   *
   * @param interaction Discord interaction context.
   * @param dto TextDto containing the email.
   * @returns Discord reply indicating linking status.
   * @example
   * /link email:your@email.com
   */
  @SkipLogging()
  @SlashCommand({
    name: "link",
    description: "Link your Discord account with your registered project account using your email.",
    defaultMemberPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.EmbedLinks],
  })
  public async linkAccount(@Context() [interaction]: SlashCommandContext, @Options() dto: TextDto) {
    const email = dto.email;
    const user = await this.authRepository.findOne({ where: { email } });

    if (!user) {
      const embed = {
        title: "❌ Account Linking Failed",
        description: [
          "No account registered with that email was found.",
          "Please verify your email and try again.",
          "",
          "Example: `/link email:your@email.com`",
        ].join("\n"),
        color: 0xe74c3c,
        thumbnail: { url: interaction.user.avatarURL?.() ?? "https://cdn.discordapp.com/embed/avatars/0.png" },
        footer: { text: "Nebura System" },
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
          title: "🔗 Account Linked Successfully",
          description: [
            "Your Discord account has been successfully linked to your project account!",
            "",
            "You can now use all features linked to your account.",
          ].join("\n"),
          fields: [
            { name: "Email", value: email, inline: true },
            { name: "Discord Username", value: discordUser.username, inline: true },
            { name: "Discord ID", value: discordUser.id, inline: true },
            { name: "Role", value: user.role, inline: true },
          ],
          color: 0x57f287,
          thumbnail: { url: discordUser.avatarURL?.() ?? "https://cdn.discordapp.com/embed/avatars/0.png" },
          footer: { text: "Nebura System" },
          timestamp: new Date().toISOString(),
        },
      ],
      flags: "Ephemeral",
    });
  }

  /**
   * Show only the current user's licenses with pagination.
   *
   * @param interaction Discord interaction context.
   * @returns Paginated Discord embeds with license details.
   * @example
   * /mylicences
   */
  @SkipLogging()
  @SlashCommand({
    name: "mylicences",
    description: "Show all your licenses registered in the system.",
    defaultMemberPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.EmbedLinks],
  })
  public async showMyLicences(@Context() [interaction]: SlashCommandContext) {
    const discordUser = interaction.user;
    const userResult = await this.toUser(discordUser.id, false, interaction);
    if (!(userResult instanceof UserEntity)) return;

    const user: UserEntity = userResult;

    const licenses = user.licenses ?? [];
    if (licenses.length === 0) {
      return interaction.reply({
        embeds: [
          {
            title: "🔑 No Licenses Found",
            description: [
              "You have no licenses registered in your account.",
              "Request a license from the administrator.",
              "",
              "Example: `/mylicences`",
            ].join("\n"),
            color: 0xe74c3c,
            footer: { text: "License Management System" },
          },
        ],
        flags: "Ephemeral",
      });
    }

    const embeds: EmbedData[] = licenses.map((lic, idx) => ({
      title: `🔑 License #${idx + 1} • ${lic.type === "premium" ? "🌟 Premium" : lic.type === "basic" ? "🔹 Basic" : "🏢 Enterprise"}`,
      description: [
        "License details:",
        `**ID:** \`${lic.id}\``,
        `**Key:** \`${lic.key}\``,
        `**Type:** \`${lic.type}\``,
        `**Created:** <t:${Math.floor(new Date(lic.createdAt).getTime() / 1000)}:f>`,
        `**Expires:** <t:${Math.floor(new Date(lic.validUntil).getTime() / 1000)}:R>`,
        `**Max IPs:** \`${lic.maxIps ?? "N/A"}\``,
        `**Request limit:** \`${lic.requestLimit ?? "N/A"}\``,
        `**Requests used:** \`${lic.requestCount ?? 0}\``,
        `**Identifier:** \`${lic.identifier ?? "N/A"}\``,
        "",
        "Use `/mylicences` to view all your licenses.",
      ].join("\n"),
      color: lic.type === "premium" ? 0xf1c40f : lic.type === "basic" ? 0x3498db : 0x8e44ad,
      fields: [
        {
          name: "IPs List",
          value:
            Array.isArray(lic.ips) && lic.ips.length
              ? lic.ips.map((ip: any, index: number) => `No.${index + 1} \`${ip}\``).join("\n")
              : "N/A",
        },
        {
          name: "HWID List",
          value:
            Array.isArray(lic.hwid) && lic.hwid.length
              ? lic.hwid.map((h: any, index: number) => `No.${index + 1} \`${h}\``).join("\n")
              : "N/A",
        },
      ],
      footer: { text: `License ${idx + 1} of ${licenses.length}` },
      timestamp: lic.createdAt,
      thumbnail: {
        url:
          lic.type === "premium"
            ? "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            : lic.type === "basic"
              ? "https://cdn-icons-png.flaticon.com/512/3135/3135716.png"
              : "https://cdn-icons-png.flaticon.com/512/3135/3135717.png",
      },
    }));

    const paginatedMessage = this.paginationService.register((builder: PaginationBuilder) => {
      return builder
        .setCustomId("mylicences-pagination")
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
   * Show your linked profile information.
   *
   * @param interaction Discord interaction context.
   * @returns Discord embed with profile information.
   * @example
   * /profile
   */
  @SkipLogging()
  @SlashCommand({
    name: "profile",
    description: "Show your linked profile information.",
    defaultMemberPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.EmbedLinks],
  })
  public async showProfile(@Context() [interaction]: SlashCommandContext) {
    const discordUser = interaction.user;
    const userResult = await this.toUser(discordUser.id, false, interaction);
    if (!(userResult instanceof UserEntity)) return;

    const user: UserEntity = userResult;
    const embed = {
      title: "👤 User Profile",
      description: ["Your linked account details are shown below.", "", "Use `/profile` to view your information."].join("\n"),
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
   * Show your QR code if your Discord account is linked.
   *
   * @param interaction Discord interaction context.
   * @returns Discord embed with QR code image.
   * @example
   * /userqr
   */
  @SkipLogging()
  @SlashCommand({
    name: "userqr",
    description: "Show your QR code if your Discord account is linked.",
    defaultMemberPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.EmbedLinks],
  })
  public async showUserQr(@Context() [interaction]: SlashCommandContext) {
    const discordUser = interaction.user;
    const userResult = await this.toUser(discordUser.id, false, interaction);
    if (!(userResult instanceof UserEntity)) return;

    const user: UserEntity = userResult;

    if (!user.qrCodeBase64) {
      return interaction.reply({
        embeds: [
          {
            title: "⚠️ QR Code Not Found",
            description: [
              "No QR code is registered for your account.",
              "You can request a QR code from the administrator.",
              "",
              "Example: `/userqr`",
            ].join("\n"),
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
            description: "**Description:** Failed to decode the QR code image. Please contact support.\n\n**Example:** `/userqr`",
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
          description: [
            "This is your personal QR code. Keep it safe and do not share it with anyone.",
            "",
            "Use `/userqr` to view your QR code.",
          ].join("\n"),
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
