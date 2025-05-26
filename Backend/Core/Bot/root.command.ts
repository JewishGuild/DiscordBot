import { Client } from "discord.js";
import { BaseCommand } from "../../Modules/Base/Commands/base.command.js";
import { ConsoleUtilities } from "../../Utilities/console.utilities.js";
import { CommandApi } from "../../Api/Client/Application/Commands/commands.api.js";

/**
 * Centralized commands manager that registers all commands dynamically.
 */
export class RootCommand {
  private static readonly logger = new ConsoleUtilities("Command", "Root");
  private static commandsCache: Array<BaseCommand> = [];

  public static async init(client: Client<true>): Promise<void> {
    this.logger.log("Initializing commands...");

    await this.attachCommands(client);
  }

  private static async attachCommands(client: Client<true>) {
    const commandsApi = new CommandApi(client);
    const response = await commandsApi.setCommands(this.commandsCache.map((command) => command.data.toJSON()));

    this.logger.log(`Registered commands: ${[...response].map(([, command]) => command.name).join(", ")}`);
  }
}
