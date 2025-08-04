import { SkipLogging } from "#common/decorators/logging.decorator";
import { UserRole } from "#common/typeRole";
import { UserEntity } from "#entity/users/user.entity";
import { LicenseEntity, LicenseType } from "#entity/utils/licence.entity";
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
import { DeleteNotificationDto, NotificationDto } from "./dto/notification.dto";

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
   * @param interaction - The interaction context.
   * @returns An embed with project details and action buttons.
   *
   * Example usage: /about
   */
  @SkipLogging()
  @SlashCommand({
    name: "about",
    description: "Show information about the project.",
    defaultMemberPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.EmbedLinks],
  })
  public async onAbout(@Context() [interaction]: SlashCommandContext) {
    const embed = {
      title: "Project Control",
      description:
        "**Description:**\nA modular, extensible, and robust API platform integrating Discord, WhatsApp, GitHub, Google Gemini AI, and more.\n\nBuilt in TypeScript for scalability and maintainability.\n\n**Example:** `/about`",
      thumbnail: { url: "https://i.pinimg.com/1200x/58/08/35/5808355cb825f18671975d00cbe10870.jpg" },
      fields: [
        { name: "Version", value: "1.0.0", inline: true },
        { name: "License", value: "MIT", inline: true },
        { name: "Author", value: "[Hiroshi025](https://github.com/Hiroshi025)", inline: true },
      ],
      color: 0x5865f2,
      footer: { text: "Use /about to see this information." },
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
  @SkipLogging()
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
        description:
          "**Description:** No account registered with that email was found.\n\n**Example:** `/link email:your@email.com`",
        color: 0xff0000,
        footer: { text: "Try again with a valid email." },
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
          description:
            "**Description:** Your Discord account has been successfully linked to your project account!\n\n**Example:** `/link email:your@email.com`",
          fields: [
            { name: "Email", value: email, inline: true },
            { name: "Discord Username", value: discordUser.username, inline: true },
          ],
          color: 0x57f287,
          thumbnail: { url: discordUser.avatarURL?.() ?? "https://cdn.discordapp.com/embed/avatars/0.png" },
          footer: { text: "You can now use all features linked to your account." },
        },
      ],
      flags: "Ephemeral",
    });
  }

  /**
   * Command to show all user licenses with pagination.
   */
  @SkipLogging()
  @SlashCommand({
    name: "licenses",
    description: "(admin) Show all your licenses registered in the system.",
    defaultMemberPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.EmbedLinks],
  })
  public async showLicenses(@Context() [interaction]: SlashCommandContext) {
    const discordUser = interaction.user;
    await this.toUser(discordUser.id, true, interaction);
    //if (!(userResult instanceof UserEntity)) return;

    //const user: UserEntity = userResult;

    const licenses = await this.authRepository.manager.getRepository(LicenseEntity).find();
    if (licenses.length === 0) {
      return interaction.reply({
        embeds: [
          {
            title: "No Licenses",
            description: "**Description:** You have no licenses registered in your account.\n\n**Example:** `/licenses`",
            color: 0xff0000,
            footer: { text: "Request a license from the admin." },
          },
        ],
        flags: "Ephemeral",
      });
    }

    const embeds: EmbedData[] = licenses.map((lic, idx) => ({
      title: `🔑 License #${idx + 1} • ${lic.type === LicenseType.PREMIUM ? "🌟 Premium" : lic.type === LicenseType.BASIC ? "🔹 Basic" : "🏢 Enterprise"}`,
      description: [
        "**Description:** License details for your account.",
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
        "**Example:** `/licenses`",
      ].join("\n"),
      color: lic.type === LicenseType.PREMIUM ? 0xf1c40f : lic.type === LicenseType.BASIC ? 0x3498db : 0x8e44ad,
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
      description: "**Description:** Your linked account details are shown below.\n\n**Example:** `/profile`",
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
            description: "**Description:** No QR code is registered for your account.\n\n**Example:** `/userqr`",
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
          description:
            "**Description:** This is your personal QR code. Keep it safe and do not share it with anyone.\n\n**Example:** `/userqr`",
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

  @SkipLogging()
  @SlashCommand({
    name: "notify",
    description: "(admin) Create a dashboard notification (developer/owner only).",
    defaultMemberPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.EmbedLinks],
  })
  public async createNotification(@Context() [interaction]: SlashCommandContext, @Options() options: NotificationDto) {
    const discordUser = interaction.user;
    await this.toUser(discordUser.id, true, interaction);
    //if (!(userResult instanceof UserEntity)) return;

    //const user: UserEntity = userResult;

    if (!options.message || options.message.length < 5) {
      return interaction.reply({
        embeds: [
          {
            title: "Invalid Message",
            description:
              "**Description:** The message must be at least 5 characters long.\n\n**Example:** `/notify message:Hello expiresInDays:2`",
            color: 0xfaa61a,
            footer: { text: "Try again with a longer message." },
          },
        ],
        flags: "Ephemeral",
      });
    }

    if (!options.expiresInDays) {
      return interaction.reply({
        embeds: [
          {
            title: "Invalid Expiration",
            description:
              "**Description:** The expiration must be a positive number of days.\n\n**Example:** `/notify message:Hello expiresInDays:2`",
            color: 0xfaa61a,
            footer: { text: "Specify a valid expiration in days." },
          },
        ],
        flags: "Ephemeral",
      });
    }

    const expiresAt = new Date(Date.now() + options.expiresInDays * 86400000);

    try {
      const res = await fetch(`${process.env.BASE_URL}/dashboard/utils/create-notification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: options.message,
          type: options.type || "info",
          expiresAt,
        }),
      });
      if (!res.ok) throw new Error("API error");
      await res.json();

      return interaction.reply({
        embeds: [
          {
            title: "Notification Created",
            description:
              "**Description:** The notification has been published on the dashboard.\n\n**Example:** `/notify message:Hello expiresInDays:2`",
            color: 0x57f287,
            footer: { text: "Check the dashboard for your notification." },
          },
        ],
        flags: "Ephemeral",
      });
    } catch (err: any) {
      console.log(err);
      return interaction.reply({
        embeds: [
          {
            title: "Error",
            description:
              "**Description:** Failed to create the notification.\n\n**Example:** `/notify message:Hello expiresInDays:2`",
            color: 0xff0000,
            footer: { text: "Try again later or contact support." },
          },
        ],
        flags: "Ephemeral",
      });
    }
  }

  @SkipLogging()
  @SlashCommand({
    name: "notifications",
    description: "(admin) Show all dashboard notifications.",
    defaultMemberPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.EmbedLinks],
  })
  public async showNotifications(@Context() [interaction]: SlashCommandContext) {
    const discordUser = interaction.user;
    await this.toUser(discordUser.id, true, interaction);
    //if (!(userResult instanceof UserEntity)) return;

    //const user: UserEntity = userResult;
    const notifications = await this.authRepository.manager
      .getRepository("NotificationEntity")
      .find({ order: { createdAt: "DESC" } });

    if (!notifications || notifications.length === 0) {
      return interaction.reply({
        embeds: [
          {
            title: "No Notifications",
            description:
              "**Description:** There are no notifications published on the dashboard.\n\n**Example:** `/notifications`",
            color: 0xff0000,
            footer: { text: "Create a notification using /notify." },
          },
        ],
        flags: "Ephemeral",
      });
    }

    const embeds: EmbedData[] = notifications.map((notif, idx) => ({
      title: `📢 Notification #${idx + 1} • ${typeof notif.type === "string" ? notif.type.charAt(0).toUpperCase() + notif.type.slice(1) : "Unknown"}`,
      description: [
        "**Description:** Dashboard notification details.",
        `> **Notification ID:** \`${notif.id}\``,
        `> **Message:** ${notif.message}`,
        "",
        "**Example:** `/notifications`",
      ].join("\n"),
      color: notif.type === "error" ? 0xe74c3c : notif.type === "warning" ? 0xf1c40f : 0x3498db,
      fields: [
        {
          name: "Expires At",
          value: notif.expiresAt ? `<t:${Math.floor(new Date(notif.expiresAt).getTime() / 1000)}:R>` : "N/A",
          inline: true,
        },
        {
          name: "Created At",
          value: notif.createdAt ? `<t:${Math.floor(new Date(notif.createdAt).getTime() / 1000)}:f>` : "N/A",
          inline: true,
        },
      ],
      footer: { text: `Notification ${idx + 1} of ${notifications.length}` },
      timestamp: notif.createdAt,
    }));

    const paginatedMessage = this.paginationService.register((builder: PaginationBuilder) => {
      return builder
        .setCustomId("notifications-pagination")
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

  @SkipLogging()
  @SlashCommand({
    name: "delete_notification",
    description: "(admin) Delete a dashboard notification by its ID (developer/owner only).",
    defaultMemberPermissions: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.EmbedLinks],
  })
  public async deleteNotification(@Context() [interaction]: SlashCommandContext, @Options() options: DeleteNotificationDto) {
    const discordUser = interaction.user;
    await this.toUser(discordUser.id, true, interaction);
    //if (!(userResult instanceof UserEntity)) return;

    //const user: UserEntity = userResult;

    const repo = this.authRepository.manager.getRepository("NotificationEntity");
    const notification = await repo.findOne({ where: { id: options.id } });

    if (!notification) {
      return interaction.reply({
        embeds: [
          {
            title: "Notification Not Found",
            description: `**Description:** No notification found with ID \`${options.id}\`.\n\n**Example:** \`/delete_notification id:123\``,
            color: 0xff0000,
            footer: { text: "Check the notification ID and try again." },
          },
        ],
        flags: "Ephemeral",
      });
    }

    await repo.delete(options.id);

    return interaction.reply({
      embeds: [
        {
          title: "Notification Deleted",
          description: `**Description:** Notification with ID \`${options.id}\` has been deleted successfully.\n\n**Example:** \`/delete_notification id:123\``,
          color: 0x57f287,
          footer: { text: "The notification is no longer visible on the dashboard." },
        },
      ],
      flags: "Ephemeral",
    });
  }

  /**
   * Command to show only the current user's licenses with pagination.
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
            title: "No Licenses",
            description: "**Description:** You have no licenses registered in your account.\n\n**Example:** `/mylicences`",
            color: 0xff0000,
            footer: { text: "Request a license from the administrator." },
          },
        ],
        flags: "Ephemeral",
      });
    }

    const embeds: EmbedData[] = licenses.map((lic, idx) => ({
      title: `🔑 License #${idx + 1} • ${lic.type === "premium" ? "🌟 Premium" : lic.type === "basic" ? "🔹 Basic" : "🏢 Enterprise"}`,
      description: [
        "**Description:** License details.",
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
        "**Example:** `/mylicences`",
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
}
