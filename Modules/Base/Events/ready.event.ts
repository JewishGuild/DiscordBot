import { Client } from "discord.js";
import { BaseEvent } from "./base.event.js";

class ReadyEvent extends BaseEvent<"ready"> {
  constructor() {
    super("ready", true);
  }

  // Handshake, must be synchronous
  public execute(client: Client<true>): void {
    this.logger.info(`Logged as client ${client.user!.username}`);
  }
}

export const readyEvent = new ReadyEvent();
