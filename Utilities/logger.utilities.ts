import { Client, Guild, MessageCreateOptions, MessagePayload, TextChannel } from "discord.js";
import { ChannelService } from "../Api/Guild/Channel/channel.service.js";
import { ConsoleUtilities } from "./console.utilities.js";

const logChannelId = "1379785979103154257";

export class LoggerUtilities {
  private static logChannel: TextChannel;
  private static readonly logger = new ConsoleUtilities("Logger");

  public static async setLogChannel(client: Client) {
    const channelService = new ChannelService(client.guilds.cache.first() as Guild);
    this.logChannel = await channelService.resolveChannelById(logChannelId);
    this.logger.success("Log channel set successfully");
  }

  public static getLogChannel() {
    return this.logChannel;
  }

  public static async log(options: string | MessagePayload | MessageCreateOptions) {
    await this.logChannel.send(options);
  }
}
