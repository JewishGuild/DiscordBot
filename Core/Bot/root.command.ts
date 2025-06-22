import { Client } from "discord.js";
import { BaseCommand } from "../../Modules/Base/Commands/base.command.js";
import { ConsoleUtilities } from "../../Utilities/console.utilities.js";
import { CommandApi } from "../../Api/Client/Application/Commands/commands.api.js";
import { applyMutedPresetCommand } from "../../Modules/Moderation/Commands/apply-muted-preset.command.js";
import { muteCommand } from "../../Modules/Moderation/Commands/mute.command.js";
import { unmuteCommand } from "../../Modules/Moderation/Commands/unmute.command.js";
import { warnCommand } from "../../Modules/Moderation/Commands/Warn/warn.command.js";
import { clearCommand } from "../../Modules/Moderation/Commands/clear.command.js";
import { announcementCommand } from "../../Modules/Interactive/Commands/Announcement/announcement.command.js";
import { roleCommand } from "../../Modules/Extra/Commands/Role/role.command.js";
import { infoCommand } from "../../Modules/Info/Commands/info.command.js";

/**
 * Centralized commands manager that registers all commands dynamically.
 */
export class RootCommand {
  private static readonly logger = new ConsoleUtilities("Command", "Root");
  private static commandsCache: Array<BaseCommand> = [
    applyMutedPresetCommand,
    muteCommand,
    unmuteCommand,
    warnCommand,
    clearCommand,
    announcementCommand,
    roleCommand,
    infoCommand
  ];

  public static async init(client: Client<true>): Promise<void> {
    this.logger.log("Initializing commands...");

    await this.attachCommands(client);
  }

  private static async attachCommands(client: Client<true>) {
    const commandsApi = new CommandApi(client);
    const response = await commandsApi.setCommands(this.commandsCache.map((command) => command.data.toJSON()));

    this.logger.success(`Registered commands: ${[...response].map(([, command]) => command.name).join(", ")}`);
  }

  public static getCommandsCache() {
    return this.commandsCache.reduce((acc, command) => {
      acc[command.name] = command;
      return acc;
    }, {} as Record<string, BaseCommand>);
  }
}
