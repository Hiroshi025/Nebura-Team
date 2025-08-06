/**
 * # Admin Interaction Commands
 *
 * This file contains all Discord slash commands for administrative actions such as notifications and license management.
 *
 * ## Commands List
 * - `/notify` - Create a dashboard notification (developer/owner only)
 * - `/notifications` - Show all dashboard notifications
 * - `/delete_notification` - Delete a dashboard notification by its ID (developer/owner only)
 * - `/licenses` - Show all your licenses registered in the system
 *
 * ## Documentation
 * - [Necord Documentation](https://necord.dev/)
 * - [Discord.js Documentation](https://discord.js.org/#/docs/main/stable/general/welcome)
 * - [TypeORM Documentation](https://typeorm.io/)
 *
 * ## Usage Example
 * ```bash
 * /notify message:Hello expiresInDays:2
 * /notifications
 * /delete_notification id:123
 * /licenses
 * ```
 */

import { SkipLogging } from "#common/decorators/logging.decorator";
import { UserRole } from "#common/typeRole";
import { UserEntity } from "#entity/users/user.entity";
import { LicenseEntity, LicenseType } from "#entity/utils/licence.entity";
import { ChatInputCommandInteraction, EmbedData, PermissionFlagsBits } from "discord.js";
import { Context, Options, SlashCommand, SlashCommandContext } from "necord";
import { Repository } from "typeorm";

import { NecordPaginationService, PageBuilder, PaginationBuilder } from "@necord/pagination";
import { Injectable } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { InjectRepository } from "@nestjs/typeorm";

import { DeleteNotificationDto, NotificationDto } from "./dto/notification.dto";

/**
 * Main class for Admin Discord interaction commands.
 * Provides administrative controls for notifications and license management via Discord slash commands.
 */
@SkipThrottle()
@SkipLogging()
@Injectable()
export class AdminInteraction {
  /**
   * Constructor for AdminInteraction.
   * @param authRepository Repository for user authentication and lookup.
   * @param paginationService Service for paginating Discord embeds.
   */
  constructor(
    @InjectRepository(UserEntity)
    private readonly authRepository: Repository<UserEntity>,
    private readonly paginationService: NecordPaginationService,
  ) {}

  /**
   * Helper to fetch a user entity by Discord ID and check developer/owner permissions.
   * @param userId Discord user ID.
   * @param development If true, restricts to developer/owner roles.
   * @param interaction Discord interaction context.
   * @returns UserEntity or Discord reply if not found or unauthorized.
   */
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
            title: "🔍 Profile Not Found",
            description:
              "No profile linked to your Discord account was found. Please link your account using `/link` before using admin commands.",
            color: 0xe74c3c,
            thumbnail: { url: interaction.user.avatarURL?.() ?? "https://cdn.discordapp.com/embed/avatars/0.png" },
            footer: { text: "Admin System" },
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
              title: "⛔ Permission Denied",
              description:
                "Only users with the roles **Developer** or **Owner** can use this command. Contact an administrator if you need access.",
              color: 0xe74c3c,
              thumbnail: { url: interaction.user.avatarURL?.() ?? "https://cdn.discordapp.com/embed/avatars/0.png" },
              footer: { text: "Admin System" },
            },
          ],
          flags: "Ephemeral",
        });
      }
    }

    return user;
  }

  /**
   * Create a dashboard notification (developer/owner only).
   * @param interaction Discord interaction context.
   * @param options NotificationDto with message, type, and expiration.
   * @returns Discord reply indicating notification creation status.
   * @example
   * /notify message:Hello expiresInDays:2
   */
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
            title: "✉️ Invalid Message",
            description:
              "The notification message must be at least **5 characters** long. Please provide a more detailed message.",
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
            title: "⏳ Invalid Expiration",
            description:
              "The expiration must be a positive number of days. Specify a valid expiration in days (e.g. `expiresInDays:2`).",
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
            title: "✅ Notification Created",
            description: [
              "Your notification has been published on the dashboard.",
              `**Message:** ${options.message}`,
              `**Type:** ${options.type || "info"}`,
              `**Expires At:** <t:${Math.floor(expiresAt.getTime() / 1000)}:R>`,
              "",
              "Check the dashboard for your notification.",
            ].join("\n"),
            color: 0x57f287,
            footer: { text: "Dashboard Notification System" },
          },
        ],
        flags: "Ephemeral",
      });
    } catch (err: any) {
      console.log(err);
      return interaction.reply({
        embeds: [
          {
            title: "❌ Notification Error",
            description: "Failed to create the notification due to an internal error. Please try again later or contact support.",
            color: 0xe74c3c,
            footer: { text: "Try again later or contact support." },
          },
        ],
        flags: "Ephemeral",
      });
    }
  }

  /**
   * Show all dashboard notifications.
   * @param interaction Discord interaction context.
   * @returns Paginated Discord embeds with notification details.
   * @example
   * /notifications
   */
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
            title: "📭 No Notifications",
            description: "There are currently no notifications published on the dashboard. Use `/notify` to create one.",
            color: 0xe74c3c,
            footer: { text: "Dashboard Notification System" },
          },
        ],
        flags: "Ephemeral",
      });
    }

    const embeds: EmbedData[] = notifications.map((notif, idx) => ({
      title: `📢 Notification #${idx + 1} • ${typeof notif.type === "string" ? notif.type.charAt(0).toUpperCase() + notif.type.slice(1) : "Unknown"}`,
      description: [
        "Dashboard notification details:",
        `**Notification ID:** \`${notif.id}\``,
        `**Message:** ${notif.message}`,
        `**Type:** ${notif.type}`,
        "",
        "Use `/delete_notification id:<ID>` to remove this notification.",
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
      thumbnail: {
        url:
          notif.type === "error"
            ? "https://cdn-icons-png.flaticon.com/512/463/463612.png"
            : notif.type === "warning"
              ? "https://cdn-icons-png.flaticon.com/512/463/463633.png"
              : "https://cdn-icons-png.flaticon.com/512/463/463639.png",
      },
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

  /**
   * Delete a dashboard notification by its ID (developer/owner only).
   * @param interaction Discord interaction context.
   * @param options DeleteNotificationDto with notification ID.
   * @returns Discord reply indicating deletion status.
   * @example
   * /delete_notification id:123
   */
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
            title: "🔎 Notification Not Found",
            description: `No notification found with ID \`${options.id}\`. Please check the notification ID and try again.`,
            color: 0xe74c3c,
            footer: { text: "Dashboard Notification System" },
          },
        ],
        flags: "Ephemeral",
      });
    }

    await repo.delete(options.id);

    return interaction.reply({
      embeds: [
        {
          title: "🗑️ Notification Deleted",
          description: `Notification with ID \`${options.id}\` has been deleted successfully and is no longer visible on the dashboard.`,
          color: 0x57f287,
          footer: { text: "Dashboard Notification System" },
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
    //if (!(userResult instanceof UserEntity)) return

    //const user: UserEntity = userResult;

    const licenses = await this.authRepository.manager.getRepository(LicenseEntity).find();
    if (licenses.length === 0) {
      return interaction.reply({
        embeds: [
          {
            title: "🔑 No Licenses",
            description: "You have no licenses registered in your account. Request a license from the administrator.",
            color: 0xe74c3c,
            footer: { text: "License Management System" },
          },
        ],
        flags: "Ephemeral",
      });
    }

    const embeds: EmbedData[] = licenses.map((lic, idx) => ({
      title: `🔑 License #${idx + 1} • ${lic.type === LicenseType.PREMIUM ? "🌟 Premium" : lic.type === LicenseType.BASIC ? "🔹 Basic" : "🏢 Enterprise"}`,
      description: [
        "License details for your account:",
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
        "Use `/licenses` to view all your licenses.",
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
      thumbnail: {
        url:
          lic.type === LicenseType.PREMIUM
            ? "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            : lic.type === LicenseType.BASIC
              ? "https://cdn-icons-png.flaticon.com/512/3135/3135716.png"
              : "https://cdn-icons-png.flaticon.com/512/3135/3135717.png",
      },
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
}
