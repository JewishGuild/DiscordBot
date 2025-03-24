import { CategoryChannelResolvable, ChannelType, Guild, OverwriteResolvable, TextChannel } from "discord.js";
import { ChannelApi } from "../channel.api.js";

/**
 * API for managing text channels in a guild.
 * Extends {@link ChannelApi} to provide methods specific to text channels.
 */
export class TextChannelApi extends ChannelApi {
  /** The default channel type for text channels. @see {@link ChannelType} */
  private readonly channelType: typeof ChannelType.GuildText;

  /**
   * Initializes the Text Channels API with the given guild instance.
   *
   * @param guild - The Discord {@link Guild} instance.
   */
  constructor(guild: Guild) {
    super(guild);
    this.channelType = ChannelType.GuildText;
  }

  /**
   * Creates a new text channel in the guild.
   *
   * @param name - The name of the text channel.
   * @param parent - The parent category channel. @see {@link CategoryChannelResolvable}
   * @param permissions - (Optional) An array of permission overwrites. Default is an empty array. @see {@link OverwriteResolvable}
   * @returns A promise resolving to the created {@link TextChannel}.
   */
  public async createTextChannel(name: string, parent: CategoryChannelResolvable, permissions: OverwriteResolvable[] = []) {
    return this.createChannel<TextChannel>({ name, type: this.channelType, parent, permissionOverwrites: permissions });
  }
}
