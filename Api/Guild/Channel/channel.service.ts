import { CategoryChannel, ChannelType, Guild, PermissionsBitField, Snowflake } from "discord.js";
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

  public async getAllTextChannels() {
    return (await this.getAllChannels()).filter((c) => c?.type === ChannelType.GuildText);
  }

  public async getAllPublicTextChannels() {
    return (await this.getAllTextChannels()).filter((channel) => {
      if (!channel.parent) {
        return true;
      }
      return this.isCategoryPublic(channel.parent);
    });
  }

  public isCategoryPublic(category: CategoryChannel): boolean {
    const everyonePermissions = category.permissionsFor(this.guild.roles.everyone);
    return (everyonePermissions?.has(PermissionsBitField.Flags.ViewChannel) && everyonePermissions?.has(PermissionsBitField.Flags.SendMessages)) ?? false;
  }
}
