import { FetchMessageOptions, Guild, GuildMessageManager, MessageResolvable, TextChannel } from "discord.js";
import { ChannelApi } from "../../channel.api.js";

export class MessageApi extends ChannelApi {
  protected readonly messageManager: GuildMessageManager;

  constructor(guild: Guild, channel: TextChannel) {
    super(guild);
    this.messageManager = channel.messages;
  }

  public async getMessages(options: MessageResolvable | FetchMessageOptions) {
    return this.messageManager.fetch(options);
  }

  public async deleteMessage(message: MessageResolvable) {
    return this.messageManager.delete(message);
  }
}
