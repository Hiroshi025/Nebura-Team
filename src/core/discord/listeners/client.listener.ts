import { SkipLogging } from "#common/decorators/logging.decorator";
import { Context, ContextOf, On } from "necord";

import { Injectable, Logger } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";

/**
 * ClientListener service to handle Discord client events.
 *
 * This service listens for the 'ready' event to log the bot's username and ID,
 * and sets the bot's activity based on configuration.
 *
 * @see {@link https://docs.necord.dev Necord Documentation}
 */
@SkipThrottle()
@SkipLogging()
@Injectable()
export class ClientListener {
  private readonly logger = new Logger(ClientListener.name);
  constructor() {}

  @On("warn")
  public onWarn(@Context() [message]: ContextOf<"warn">) {
    this.logger.warn(message);
  }

  @On("error")
  public onError(@Context() [error]: ContextOf<"error">) {
    this.logger.error(error);
  }
}
