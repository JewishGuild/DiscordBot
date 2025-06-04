import { Guild, Snowflake } from "discord.js";
import { ChannelApi } from "./channel.api.js";

export class ChannelService extends ChannelApi {
  constructor(guild: Guild) {
    super(guild);
  }

  public async resolveChannelById<T>(id: Snowflake) {
    const channel = (await this.getChannelById(id)) as T;
    if (!channel) throw new Error("Invalid, user is not a member in this guild.");
    return channel;
  }
}
