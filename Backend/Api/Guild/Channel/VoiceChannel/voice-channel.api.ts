import { CategoryChannelResolvable, ChannelType, Guild, OverwriteResolvable, VoiceChannel } from "discord.js";
import { ChannelApi } from "../channel.api.js";

/**
 * API for managing voice channels in a guild.
 * Extends {@link ChannelApi} to provide methods specific to voice channels.
 */
export class VoiceChannelsApi extends ChannelApi {
  /** The default channel type for voice channels. @see {@link ChannelType} */
  private readonly channelType: typeof ChannelType.GuildVoice;

  /**
   * Initializes the Voice Channels API with the given guild instance.
   *
   * @param guild - The Discord {@link Guild} instance.
   */
  constructor(guild: Guild) {
    super(guild);
    this.channelType = ChannelType.GuildVoice;
  }

  /**
   * Creates a new voice channel in the guild.
   *
   * @param name - The name of the voice channel.
   * @param parent - The parent category channel. @see {@link CategoryChannelResolvable}
   * @param permissions - (Optional) An array of permission overwrites. Default is an empty array. @see {@link OverwriteResolvable}
   * @param limit - (Optional) The maximum number of users allowed in the channel.
   * @param position - (Optional) The position of the channel in the category.
   * @returns A promise resolving to the created {@link VoiceChannel}.
   */
  public async createVoiceChannel(name: string, parent: CategoryChannelResolvable, permissions: OverwriteResolvable[] = [], limit?: number, position?: number) {
    return this.createChannel<VoiceChannel>({ name, type: this.channelType, parent, permissionOverwrites: permissions, userLimit: limit, position });
  }
}
