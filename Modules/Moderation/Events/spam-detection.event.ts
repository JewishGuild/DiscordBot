import { Client, Message } from "discord.js";
import { BaseEvent } from "../../Base/Events/base.event.js";

class SpamDetectionEvent extends BaseEvent<"messageCreate"> {
  constructor() {
    super("messageCreate", true);
  }

  public async execute(client: Client<true>, message: Message): Promise<void> {}
}

export const spamDetectionEvent = new SpamDetectionEvent();
