/* eslint-disable no-empty-pattern */
import { Client } from "discord.js";
import { Context, ContextOf, On, Once } from "necord";

import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ClientUpdate {
  private readonly logger = new Logger(ClientUpdate.name);

  public constructor(
    private readonly client: Client,
    private readonly config: ConfigService,
  ) {}

  @Once("ready")
  public onReady(@Context() []: ContextOf<"ready">) {
    this.logger.log(`Bot logged in as ${this.client.user?.username} (${this.client.user?.id})`);
    this.client.user?.setActivity(this.config.get("necord.presence.activity.name"));

    const validStatus = ["online", "idle", "dnd", "invisible"];
    const status: string = this.config.get("necord.presence.status", "online");
    if (validStatus.includes(status)) {
      this.client.user?.setStatus(status as "online" | "idle" | "dnd" | "invisible");
    } else {
      this.logger.warn(`Invalid status "${status}" provided, defaulting to "online".`);
      this.client.user?.setStatus("online");
    }
  }

  @On("warn")
  public onWarn(@Context() [message]: ContextOf<"warn">) {
    this.logger.warn(message);
  }
}
