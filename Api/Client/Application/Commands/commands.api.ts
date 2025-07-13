import {
  ApplicationCommandDataResolvable,
  ApplicationCommandResolvable,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
  Snowflake,
  ApplicationCommandManager,
  Client
} from "discord.js";
import { ApplicationApi } from "../application.api.js";

export type Commands = (RESTPostAPIChatInputApplicationCommandsJSONBody | RESTPostAPIContextMenuApplicationCommandsJSONBody)[];

/**
 * API for managing Discord application command.
 * Extends {@link ApplicationApi} to provide methods for setting, editing, and resetting commands.
 */
export class CommandApi extends ApplicationApi {
  /** Manages the application's registered command. @see {@link ApplicationCommandManager} */
  protected readonly commandManager: ApplicationCommandManager;

  /**
   * Initializes the Command API with the given bot client.
   *
   * @param client - The Discord {@link Client} instance.
   */
  constructor(client: Client) {
    super(client);
    this.commandManager = this.clientApplication.commands;
  }

  /**
   * Registers or updates application commands.
   *
   * @param commands - An array of commands to register.
   * @param guildId - (Optional) The ID of the guild to register commands in. If omitted, commands are set globally.
   * @returns A promise resolving to the updated list of commands.
   */
  public async setCommands(commands: Commands, guildId?: Snowflake) {
    if (guildId) {
      return this.commandManager.set(commands, guildId);
    }
    return this.commandManager.set(commands);
  }

  /**
   * Edits an existing application command.
   *
   * @param command - The command to edit.
   * @param data - The updated command data.
   * @returns A promise resolving to the modified command.
   */
  public async editCommand(command: ApplicationCommandResolvable, data: Partial<ApplicationCommandDataResolvable>) {
    return this.commandManager.edit(command, data);
  }

  /**
   * Removes all globally registered application commands.
   *
   * @returns A promise resolving to an empty list of commands.
   */
  public async resetCommands() {
    return this.commandManager.set([]);
  }

  public async fetchCommands() {
    return this.commandManager.fetch();
  }

  public async getEntryPoint() {
    const existingCommands = await this.fetchCommands();
    return existingCommands.find(({ type, name, integrationTypes }) => type === 4 && name === "launch" && integrationTypes?.includes(1));
  }
}
