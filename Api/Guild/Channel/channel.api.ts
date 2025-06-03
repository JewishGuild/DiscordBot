import {
  BaseFetchOptions,
  GuildBasedChannel,
  GuildChannelCreateOptions,
  GuildChannelEditOptions,
  SetChannelPositionOptions,
  Snowflake,
  GuildChannelResolvable,
  Guild,
  GuildChannelManager,
  GuildChannel
} from "discord.js";
import { GuildApi } from "../guild.api.js";

/**
 * API for managing guild channels.
 * Extends {@link GuildApi} to provide utilities for creating, modifying, and retrieving channels.
 */
export class ChannelApi extends GuildApi {
  /** Manages the guild's channels. @see {@link GuildChannelManager} */
  protected readonly channelManager: GuildChannelManager;

  /**
   * Initializes the Channel API with the given guild instance.
   *
   * @param guild - The Discord {@link Guild} instance.
   */
  constructor(guild: Guild) {
    super(guild);
    this.channelManager = this.guild.channels;
  }

  /**
   * Fetches a guild channel by its ID.
   *
   * @param id - The channel ID.
   * @param options - (Optional) Fetch options. @see {@link BaseFetchOptions}
   * @returns A promise resolving to the fetched channel.
   */
  public async getChannelById<T = GuildBasedChannel>(id: string, options?: BaseFetchOptions) {
    return this.channelManager.fetch(id as Snowflake, options) as T;
  }

  /**
   * Fetches all guild channels.
   *
   * @returns A promise resolving to a collection of all fetched channels.
   */
  public async getAllChannels() {
    return this.channelManager.fetch(undefined, { cache: true });
  }

  /**
   * Creates a new guild channel.
   *
   * @param options - The channel creation options. @see {@link GuildChannelCreateOptions}
   * @returns A promise resolving to the created channel.
   */
  protected async createChannel<T = GuildChannel>(options: GuildChannelCreateOptions) {
    return this.channelManager.create(options) as T;
  }

  /**
   * Deletes a guild channel.
   *
   * @param channel - The channel to delete.
   * @param reason - (Optional) The reason for deletion.
   * @returns A promise resolving when the channel is deleted.
   */
  public async deleteChannel(channel: GuildChannelResolvable, reason?: string) {
    return this.channelManager.delete(channel, reason);
  }

  /**
   * Edits a guild channel.
   *
   * @param channel - The channel to edit.
   * @param options - The updated channel options. @see {@link GuildChannelEditOptions}
   * @returns A promise resolving to the edited channel.
   */
  public async editChannel<T = GuildChannel>(channel: GuildChannelResolvable, options: GuildChannelEditOptions) {
    return this.channelManager.edit(channel, options) as T;
  }

  /**
   * Sets the position of a guild channel.
   *
   * @param channel - The channel to reposition.
   * @param position - The new position index.
   * @param options - (Optional) Positioning options. @see {@link SetChannelPositionOptions}
   * @returns A promise resolving when the position is updated.
   */
  public async setChannelPosition(channel: GuildChannelResolvable, position: number, options?: SetChannelPositionOptions) {
    return this.channelManager.setPosition(channel, position, options);
  }
}
