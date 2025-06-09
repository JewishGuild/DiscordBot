import { Guild, Snowflake, TextChannel } from "discord.js";
import { MessageApi } from "./message.api.js";

export class MessageService extends MessageApi {
  constructor(guild: Guild, channel: TextChannel) {
    super(guild, channel);
  }

  public async resolveMessageById(id: Snowflake) {
    const message = await this.getMessages(id);
    if (!message) throw new Error("Invalid, message not found in this channel.");
    return message;
  }
}
