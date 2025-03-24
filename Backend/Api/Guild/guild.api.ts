import { Guild } from "discord.js";

/**
 * API for managing a specific Discord guild.
 * Provides utilities for interacting with the {@link Guild} instance.
 */
export class GuildApi {
  /** The Discord guild instance. @see {@link Guild} */
  protected readonly guild: Guild;

  /**
   * Initializes the Guild API with the given guild instance.
   *
   * @param guild - The Discord {@link Guild} instance.
   */
  constructor(guild: Guild) {
    this.guild = guild;
  }

  /**
   * Removes all registered application commands in the guild.
   *
   * @returns A promise that resolves when the commands are cleared.
   */
  public async resetGuildCommands() {
    await this.guild.commands.set([]);
  }
}
