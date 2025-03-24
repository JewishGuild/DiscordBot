import { Client } from "discord.js";
import { BaseEvent } from "./base.event.js";

export class ReadyEvent extends BaseEvent<"ready"> {
  constructor() {
    super("ready", true);
  }

  public async execute(client: Client<true>): Promise<void> {
    this.logger.log(`Logged as client ${client.user!.username}`);
  }
}
