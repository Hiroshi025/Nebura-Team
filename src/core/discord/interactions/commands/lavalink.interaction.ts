/**
 * # Lavalink Interaction Commands
 *
 * This file contains all Discord slash commands for controlling music playback via Lavalink.
 *
 * ## Commands List
 * - `/play` - Play a track from a source
 * - `/pause` - Pause the current playback
 * - `/resume` - Resume the paused playback
 * - `/stop` - Stop playback and clear the queue
 * - `/skip` - Skip the current track
 * - `/queue` - Show the current playback queue
 * - `/volume` - Change the playback volume
 * - `/nowplaying` - Show info about the current track
 * - `/remove` - Remove a specific track from the queue
 * - `/shuffle` - Shuffle the playback queue
 * - `/repeat` - Repeat the current track or the queue
 * - `/seek` - Seek to a specific time in the current track
 *
 * ## Documentation
 * - [Lavalink Documentation](https://github.com/freyacodes/Lavalink)
 * - [Necord Documentation](https://necord.dev/)
 *
 * ## Usage Example
 * ```bash
 * /play query:Never Gonna Give You Up source:ytsearch
 * /pause
 * /resume
 * /stop
 * /skip
 * /queue
 * /volume amount:50
 * /nowplaying
 * /remove position:2
 * /shuffle
 * /repeat mode:track
 * /seek position:60
 * ```
 */

/* eslint-disable @typescript-eslint/no-floating-promises */
import { SkipLogging } from "#common/decorators/logging.decorator";
import { SourceAutocompleteInterceptor } from "#core/discord/lib/common/autocomplete";
import { RepeatMode } from "lavalink-client";
import { Context, Options, SlashCommand, SlashCommandContext } from "necord";

import { NecordLavalinkService, PlayerManager } from "@necord/lavalink";
import { Injectable, UseInterceptors } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";

import { QueryDto } from "./dto/lavalink/query.dto";
import { RemoveDto } from "./dto/lavalink/remove.dto";
import { RepeatDto } from "./dto/lavalink/repeat.dto";
import { SeekDto } from "./dto/lavalink/seek.dto";
import { VolumeDto } from "./dto/lavalink/volume.dto";

/**
 * Main class for Lavalink Discord interaction commands.
 * Provides all music playback controls via Discord slash commands.
 */
@SkipThrottle()
@SkipLogging()
@Injectable()
export class LavalinkInteaction {
  /**
   * Constructor for LavalinkInteaction.
   * @param playerManager PlayerManager instance for managing music players.
   * @param lavalinkService NecordLavalinkService instance for extracting player info.
   */
  public constructor(
    private readonly playerManager: PlayerManager,
    private readonly lavalinkService: NecordLavalinkService,
  ) {}

  /**
   * Play a track from a source.
   * @param interaction Discord interaction context.
   * @param query Track search query.
   * @param source Music source (e.g., ytsearch, soundcloud).
   * @returns Discord reply with now playing info.
   * @example
   * /play query:Never Gonna Give You Up source:ytsearch
   */
  @UseInterceptors(SourceAutocompleteInterceptor)
  @SlashCommand({ name: "play", description: "play a track from a source" })
  public async onPlay(@Context() [interaction]: SlashCommandContext, @Options() { query, source }: QueryDto) {
    if (!interaction.guild)
      return interaction.reply({
        embeds: [
          {
            author: {
              name: interaction.user.username,
              icon_url: interaction.user.avatarURL() || undefined,
            },
            title: "Guild Required",
            description:
              "❌ This command can only be used inside a Discord server (guild). Please try again in a server channel.",
            color: 0xe74c3c,
            footer: { text: "Lavalink Music System" },
          },
        ],
        flags: "Ephemeral",
      });

    const player =
      this.playerManager.get(interaction.guild.id) ??
      this.playerManager.create({
        ...this.lavalinkService.extractInfoForPlayer(interaction),
        selfDeaf: true,
        selfMute: false,
        volume: 100,
      });

    await player.connect();
    const res = await player.search(
      {
        query,
        source: source ?? "ytsearch",
      },
      interaction.user.id,
    );

    await player.queue.add(res.tracks[0]);
    if (!player.playing) await player.play();
    const track = res.tracks[0];
    return interaction.reply({
      embeds: [
        {
          author: {
            name: interaction.user.username,
            icon_url: interaction.user.avatarURL() || undefined,
          },
          title: "🎶 Now Playing",
          description: [
            `**Title:** [${track.info.title}](${track.info.uri})`,
            `**Author:** ${track.info.author}`,
            `**Duration:** ${Math.floor((track.info.duration ?? 0) / 60000)}m ${Math.floor(((track.info.duration ?? 0) % 60000) / 1000)}s`,
            `**Source:** ${source ?? "ytsearch"}`,
            "",
            "Enjoy your music! Use `/queue` to see upcoming tracks.",
          ].join("\n"),
          thumbnail: { url: track.info.artworkUrl ?? "https://cdn.discordapp.com/embed/avatars/0.png" },
          color: 0x1abc9c,
          footer: { text: `Requested by ${interaction.user.username}` },
        },
      ],
    });
  }

  /**
   * Pause the current playback.
   * @param interaction Discord interaction context.
   * @returns Discord reply indicating playback is paused.
   * @example
   * /pause
   */
  @SlashCommand({ name: "pause", description: "Pause the current playback." })
  public async onPause(@Context() [interaction]: SlashCommandContext) {
    const player = this.playerManager.get(interaction.guild?.id ?? "");
    if (!player || !player.playing) {
      return interaction.reply({
        embeds: [
          {
            title: "Pause Failed",
            description: "⏸️ **No track is currently playing to pause.**\n\nTry using `/play` to start music playback.",
            color: 0xe74c3c,
            footer: { text: "Lavalink Music System" },
          },
        ],
        flags: "Ephemeral",
      });
    }
    await player.pause();
    const track = player.queue.current ?? player.queue.tracks[0];
    return interaction.reply({
      embeds: [
        {
          title: "⏸️ Playback Paused",
          description: [
            `**Track:** ${track?.info?.title ?? "Unknown"}`,
            `**Author:** ${track?.info?.author ?? "Unknown"}`,
            "",
            "Playback has been paused. Use `/resume` to continue.",
          ].join("\n"),
          color: 0xf1c40f,
          thumbnail: { url: track?.info?.artworkUrl ?? "https://cdn.discordapp.com/embed/avatars/0.png" },
          footer: { text: "Use /resume to continue playback." },
        },
      ],
      flags: "Ephemeral",
    });
  }

  /**
   * Resume the paused playback.
   * @param interaction Discord interaction context.
   * @returns Discord reply indicating playback is resumed.
   * @example
   * /resume
   */
  @SlashCommand({ name: "resume", description: "Resume the paused playback." })
  public async onResume(@Context() [interaction]: SlashCommandContext) {
    const player = this.playerManager.get(interaction.guild?.id ?? "");
    if (!player || !player.paused) {
      return interaction.reply({
        embeds: [
          {
            title: "Resume Failed",
            description: "▶️ **No track is paused to resume.**\n\nPause a track first using `/pause`.",
            color: 0xe74c3c,
            footer: { text: "Lavalink Music System" },
          },
        ],
        flags: "Ephemeral",
      });
    }
    await player.resume();
    const track = player.queue.current ?? player.queue.tracks[0];
    return interaction.reply({
      embeds: [
        {
          title: "▶️ Playback Resumed",
          description: [
            `**Track:** ${track?.info?.title ?? "Unknown"}`,
            `**Author:** ${track?.info?.author ?? "Unknown"}`,
            "",
            "Playback has been resumed. Enjoy your music!",
          ].join("\n"),
          color: 0x2ecc71,
          thumbnail: { url: track?.info?.artworkUrl ?? "https://cdn.discordapp.com/embed/avatars/0.png" },
          footer: { text: "Enjoy your music!" },
        },
      ],
      flags: "Ephemeral",
    });
  }

  /**
   * Stop playback and clear the queue.
   * @param interaction Discord interaction context.
   * @returns Discord reply indicating playback is stopped and queue cleared.
   * @example
   * /stop
   */
  @SlashCommand({ name: "stop", description: "Stop playback and clear the queue." })
  public async onStop(@Context() [interaction]: SlashCommandContext) {
    const player = this.playerManager.get(interaction.guild?.id ?? "");
    if (!player || !player.playing) {
      return interaction.reply({
        embeds: [
          {
            title: "Stop Failed",
            description: "⏹️ **No track is currently playing to stop.**\n\nTry using `/play` to start music playback.",
            color: 0xe74c3c,
            footer: { text: "Lavalink Music System" },
          },
        ],
        flags: "Ephemeral",
      });
    }
    await player.destroy();
    player.queue.tracks.splice(0, player.queue.tracks.length);
    return interaction.reply({
      embeds: [
        {
          title: "⏹️ Playback Stopped",
          description: "Playback has been stopped and the queue cleared. All tracks have been removed from the queue.",
          color: 0xe74c3c,
          footer: { text: "Queue is now empty." },
        },
      ],
      flags: "Ephemeral",
    });
  }

  /**
   * Skip the current track.
   * @param interaction Discord interaction context.
   * @returns Discord reply indicating track is skipped.
   * @example
   * /skip
   */
  @SlashCommand({ name: "skip", description: "Skip the current track." })
  public async onSkip(@Context() [interaction]: SlashCommandContext) {
    const player = this.playerManager.get(interaction.guild?.id ?? "");
    if (!player || !player.playing) {
      return interaction.reply({
        embeds: [
          {
            title: "Skip Failed",
            description: "⏭️ **No track is currently playing to skip.**\n\nTry using `/play` to start music playback.",
            color: 0xe74c3c,
            footer: { text: "Lavalink Music System" },
          },
        ],
        flags: "Ephemeral",
      });
    }
    const track = player.queue.current ?? player.queue.tracks[0];
    await player.skip();
    return interaction.reply({
      embeds: [
        {
          title: "⏭️ Track Skipped",
          description: [
            `**Skipped Track:** ${track?.info?.title ?? "Unknown"}`,
            `**Author:** ${track?.info?.author ?? "Unknown"}`,
            "",
            "The next track in the queue is now playing.",
          ].join("\n"),
          color: 0x3498db,
          thumbnail: { url: track?.info?.artworkUrl ?? "https://cdn.discordapp.com/embed/avatars/0.png" },
          footer: { text: "Next track is now playing." },
        },
      ],
      flags: "Ephemeral",
    });
  }

  /**
   * Show the current playback queue.
   * @param interaction Discord interaction context.
   * @returns Discord reply with the current queue.
   * @example
   * /queue
   */
  @SlashCommand({ name: "queue", description: "Show the current playback queue." })
  public async onQueue(@Context() [interaction]: SlashCommandContext) {
    const player = this.playerManager.get(interaction.guild?.id ?? "");
    if (!player || player.queue.tracks.length === 0) {
      return interaction.reply({
        embeds: [
          {
            title: "Queue Empty",
            description: "📭 **There are no tracks in the queue.**\n\nAdd tracks using `/play`.",
            color: 0xe74c3c,
            footer: { text: "Lavalink Music System" },
          },
        ],
        flags: "Ephemeral",
      });
    }
    const tracks = player.queue.tracks
      .slice(0, 10)
      .map(
        (track: any, idx: number) =>
          `**${idx + 1}.** [${track.info.title}](${track.info.uri}) by \`${track.info.author}\` (${Math.floor((track.info.duration ?? 0) / 60000)}m ${Math.floor(((track.info.duration ?? 0) % 60000) / 1000)}s)`,
      )
      .join("\n");
    return interaction.reply({
      embeds: [
        {
          title: "📋 Current Queue",
          description: [
            "**Upcoming Tracks:**",
            tracks,
            "",
            `**Total tracks:** ${player.queue.tracks.length}`,
            "Use `/skip` to go to the next track.",
          ].join("\n"),
          color: 0x5865f2,
          footer: { text: `Requested by ${interaction.user.username}` },
        },
      ],
      flags: "Ephemeral",
    });
  }

  /**
   * Change the playback volume.
   * @param interaction Discord interaction context.
   * @param dto VolumeDto containing the desired volume amount.
   * @returns Discord reply indicating volume change.
   * @example
   * /volume amount:50
   */
  @SlashCommand({ name: "volume", description: "Change the playback volume." })
  public async onVolume(@Context() [interaction]: SlashCommandContext, @Options() dto: VolumeDto) {
    const player = this.playerManager.get(interaction.guild?.id ?? "");
    if (!player) {
      return interaction.reply({
        embeds: [
          {
            title: "Volume Change Failed",
            description: "🔊 **No player found for this guild.**\n\nPlay a track first using `/play`.",
            color: 0xe74c3c,
            footer: { text: "Lavalink Music System" },
          },
        ],
        flags: "Ephemeral",
      });
    }
    await player.setVolume(dto.amount);
    return interaction.reply({
      embeds: [
        {
          title: "🔊 Volume Changed",
          description: `The playback volume has been set to **${dto.amount}**%. Adjust as needed for your listening experience.`,
          color: 0x1abc9c,
          footer: { text: "Use /volume to adjust again." },
        },
      ],
      flags: "Ephemeral",
    });
  }

  /**
   * Show info about the current track.
   * @param interaction Discord interaction context.
   * @returns Discord reply with current track info.
   * @example
   * /nowplaying
   */
  @SlashCommand({ name: "nowplaying", description: "Show info about the current track." })
  public async onNowPlaying(@Context() [interaction]: SlashCommandContext) {
    const player = this.playerManager.get(interaction.guild?.id ?? "");
    const currentTrack = player?.queue?.current ?? player?.queue?.tracks[0];
    if (!player || !player.playing || !currentTrack) {
      return interaction.reply({
        embeds: [
          {
            title: "No Track Playing",
            description: "🎵 **There is no track currently playing.**\n\nUse `/play` to start music playback.",
            color: 0xe74c3c,
            footer: { text: "Lavalink Music System" },
          },
        ],
        flags: "Ephemeral",
      });
    }
    const track = currentTrack;
    return interaction.reply({
      embeds: [
        {
          title: "🎵 Now Playing",
          description: [
            `**Title:** [${track.info.title}](${track.info.uri})`,
            `**Author:** ${track.info.author}`,
            `**Duration:** ${Math.floor((track.info?.duration ?? 0) / 60000)}m ${Math.floor(((track.info?.duration ?? 0) % 60000) / 1000)}s`,
            `**Source:** ${track.info.sourceName ?? "Unknown"}`,
            "",
            "**Track Info:**",
            `• **Identifier:** ${track.info.identifier}`,
            `• **Is Stream:** ${track.info.isStream ? "Yes" : "No"}`,
            `• **Position:** ${Math.floor((player.position ?? 0) / 1000)}s`,
            "",
            "Enjoy your music! Use `/queue` to see upcoming tracks.",
          ].join("\n"),
          thumbnail: { url: track.info.artworkUrl ?? "https://cdn.discordapp.com/embed/avatars/0.png" },
          color: 0x2ecc71,
          footer: { text: `Requested by ${interaction.user.username}` },
        },
      ],
      flags: "Ephemeral",
    });
  }

  /**
   * Remove a specific track from the queue.
   * @param interaction Discord interaction context.
   * @param dto RemoveDto containing the position to remove.
   * @returns Discord reply indicating track removal.
   * @example
   * /remove position:2
   */
  @SlashCommand({ name: "remove", description: "Remove a specific track from the queue." })
  public async onRemove(@Context() [interaction]: SlashCommandContext, @Options() dto: RemoveDto) {
    const player = this.playerManager.get(interaction.guild?.id ?? "");
    if (!player || player.queue.tracks.length === 0) {
      return interaction.reply({
        embeds: [
          {
            title: "Remove Failed",
            description: "🗑️ **The queue is empty.**\n\nAdd tracks using `/play` before trying to remove.",
            color: 0xe74c3c,
            footer: { text: "Lavalink Music System" },
          },
        ],
        flags: "Ephemeral",
      });
    }
    if (dto.position < 1 || dto.position > player.queue.tracks.length) {
      return interaction.reply({
        embeds: [
          {
            title: "Invalid Position",
            description: `❌ **Position must be between 1 and ${player.queue.tracks.length}.**\n\nCheck the queue positions using \`/queue\`.`,
            color: 0xe74c3c,
            footer: { text: "Lavalink Music System" },
          },
        ],
        flags: "Ephemeral",
      });
    }
    const removed = player.queue.tracks.splice(dto.position - 1, 1)[0];
    return interaction.reply({
      embeds: [
        {
          title: "🗑️ Track Removed",
          description: [
            `**Removed Track:** ${removed.info.title}`,
            `**Author:** ${removed.info.author}`,
            `**Position:** ${dto.position}`,
            "",
            "Queue updated. Use `/queue` to see the new order.",
          ].join("\n"),
          color: 0xf39c12,
          thumbnail: { url: removed.info.artworkUrl ?? "https://cdn.discordapp.com/embed/avatars/0.png" },
          footer: { text: "Track removed from queue." },
        },
      ],
      flags: "Ephemeral",
    });
  }

  /**
   * Shuffle the playback queue.
   * @param interaction Discord interaction context.
   * @returns Discord reply indicating queue shuffle.
   * @example
   * /shuffle
   */
  @SlashCommand({ name: "shuffle", description: "Shuffle the playback queue." })
  public async onShuffle(@Context() [interaction]: SlashCommandContext) {
    const player = this.playerManager.get(interaction.guild?.id ?? "");
    if (!player || player.queue.tracks.length < 2) {
      return interaction.reply({
        embeds: [
          {
            title: "Shuffle Failed",
            description: "🔀 **Need at least 2 tracks in the queue to shuffle.**\n\nAdd more tracks using `/play`.",
            color: 0xe74c3c,
            footer: { text: "Lavalink Music System" },
          },
        ],
        flags: "Ephemeral",
      });
    }
    player.queue.shuffle();
    return interaction.reply({
      embeds: [
        {
          title: "🔀 Queue Shuffled",
          description: "The queue has been shuffled. Enjoy the new order of your tracks!",
          color: 0x8e44ad,
          footer: { text: "Queue shuffled successfully." },
        },
      ],
      flags: "Ephemeral",
    });
  }

  /**
   * Repeat the current track or the queue.
   * @param interaction Discord interaction context.
   * @param dto RepeatDto containing the repeat mode.
   * @returns Discord reply indicating repeat mode change.
   * @example
   * /repeat mode:track
   */
  @SlashCommand({ name: "repeat", description: "Repeat the current track or the queue." })
  public async onRepeat(@Context() [interaction]: SlashCommandContext, @Options() dto: RepeatDto) {
    const player = this.playerManager.get(interaction.guild?.id ?? "");
    if (!player) {
      return interaction.reply({
        embeds: [
          {
            title: "Repeat Failed",
            description: "🔁 **No player found for this guild.**\n\nPlay a track first using `/play`.",
            color: 0xe74c3c,
            footer: { text: "Lavalink Music System" },
          },
        ],
        flags: "Ephemeral",
      });
    }
    // Convert string to RepeatMode enum
    const repeatModeMap: Record<string, RepeatMode> = {
      track: "track",
      queue: "queue",
      off: "off",
    };
    const repeatMode = repeatModeMap[dto.mode];
    player.setRepeatMode(repeatMode);
    return interaction.reply({
      embeds: [
        {
          title: "🔁 Repeat Mode Set",
          description: [
            `Repeat mode has been set to **${dto.mode.toUpperCase()}**.`,
            "",
            "Use `/repeat` to change mode again.",
          ].join("\n"),
          color: 0x3498db,
          footer: { text: "Repeat mode updated." },
        },
      ],
      flags: "Ephemeral",
    });
  }

  /**
   * Seek to a specific time in the current track.
   * @param interaction Discord interaction context.
   * @param dto SeekDto containing the position in seconds.
   * @returns Discord reply indicating seek position.
   * @example
   * /seek position:60
   */
  @SlashCommand({ name: "seek", description: "Seek to a specific time in the current track." })
  public async onSeek(@Context() [interaction]: SlashCommandContext, @Options() dto: SeekDto) {
    const player = this.playerManager.get(interaction.guild?.id ?? "");
    if (!player || !player.playing || !player.queue.current) {
      return interaction.reply({
        embeds: [
          {
            title: "Seek Failed",
            description: "⏩ **No track is currently playing to seek.**\n\nPlay a track first using `/play`.",
            color: 0xe74c3c,
            footer: { text: "Lavalink Music System" },
          },
        ],
        flags: "Ephemeral",
      });
    }
    await player.seek(dto.position * 1000);
    const track = player.queue.current;
    return interaction.reply({
      embeds: [
        {
          title: "⏩ Track Seeked",
          description: [
            `Seeked to **${dto.position} seconds** in the current track.`,
            `**Track:** ${track?.info?.title ?? "Unknown"}`,
            `**Author:** ${track?.info?.author ?? "Unknown"}`,
            "",
            "Use `/seek` again to jump to another position.",
          ].join("\n"),
          color: 0x2ecc71,
          thumbnail: { url: track?.info?.artworkUrl ?? "https://cdn.discordapp.com/embed/avatars/0.png" },
          footer: { text: "Enjoy your music!" },
        },
      ],
      flags: "Ephemeral",
    });
  }
}
