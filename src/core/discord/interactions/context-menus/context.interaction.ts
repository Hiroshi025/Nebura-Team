import { SkipLogging } from "#common/decorators/logging.decorator";
import { User } from "discord.js";
import { Context, TargetUser, UserCommand, UserCommandContext } from "necord";

import { Injectable } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";

@SkipThrottle()
@SkipLogging()
@Injectable()
export class ContextInteraction {
  @UserCommand({ name: "Get avatar" })
  public async getUserAvatar(@Context() [interaction]: UserCommandContext, @TargetUser() user: User) {
    return interaction.reply({
      embeds: [
        {
          title: `Avatar ${user.username}`,
          image: { url: user.displayAvatarURL({ size: 4096, forceStatic: true }) },
        },
      ],
    });
  }
}
