import { Client } from "discord.js";
import { BaseEvent } from "./base.event.js";

class ReadyEvent extends BaseEvent<"ready"> {
  constructor() {
    super("ready", true);
  }

  public async execute(client: Client<true>): Promise<void> {
    this.logger.info(`Logged as client ${client.user!.username}`);
  }
}

export const readyEvent = new ReadyEvent();
