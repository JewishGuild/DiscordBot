import { CategoryChannel, ChannelType, Guild, OverwriteResolvable } from "discord.js";
import { ChannelApi } from "../channel.api.js";

/**
 * API for managing category channels in a guild.
 * Extends {@link ChannelApi} to provide methods specific to category channels.
 */
export class CategoryChannelApi extends ChannelApi {
  /** The default channel type for category channels. @see {@link ChannelType} */
  private readonly channelType: typeof ChannelType.GuildCategory;

  /**
   * Initializes the Category Channels API with the given guild instance.
   *
   * @param guild - The Discord {@link Guild} instance.
   */
  constructor(guild: Guild) {
    super(guild);
    this.channelType = ChannelType.GuildCategory;
  }

  /**
   * Creates a new category channel in the guild.
   *
   * @param name - The name of the category channel.
   * @param permissions - (Optional) An array of permission overwrites. Default is an empty array. @see {@link OverwriteResolvable}
   * @returns A promise resolving to the created {@link CategoryChannel}.
   */
  public async createCategoryChannel(name: string, permissions: OverwriteResolvable[] = []) {
    return this.createChannel<CategoryChannel>({ name, type: this.channelType, permissionOverwrites: permissions });
  }
}
