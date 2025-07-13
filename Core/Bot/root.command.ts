import { Client } from "discord.js";
import { BaseCommand, BaseSlashCommand, CommandBuilder } from "../../Modules/Base/Commands/base.command.js";
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
import { permanentMuteCommand } from "../../Modules/Moderation/Commands/permanent-mute.command.js";
import { purgeMessages } from "../../Modules/Moderation/Commands/purge-messages.command.js";

/**
 * Centralized commands manager that registers all commands dynamically.
 */
export class RootCommand {
  private static readonly logger = new ConsoleUtilities("Command", "Root");
  private static commandsCache: Array<BaseCommand<CommandBuilder>> = [
    applyMutedPresetCommand,
    muteCommand,
    unmuteCommand,
    warnCommand,
    clearCommand,
    announcementCommand,
    roleCommand,
    infoCommand,
    permanentMuteCommand,
    purgeMessages
  ];

  public static async init(client: Client<true>): Promise<void> {
    this.logger.log("Initializing commands...");

    await this.attachCommands(client);
  }

  private static async attachCommands(client: Client<true>) {
    const commandApi = new CommandApi(client);
    const entryCommand = await commandApi.getEntryPoint();
    const commands = this.commandsCache.map((command) => command.data.toJSON());

    if (entryCommand) {
      commands.unshift(entryCommand.toJSON() as any);
    }

    const response = await commandApi.setCommands(commands);
    this.logger.success(`Registered commands: ${[...response].map(([, command]) => command.name).join(", ")}`);
  }

  public static getCommandsCache() {
    return this.commandsCache.reduce((acc, command) => {
      acc[command.name] = command;
      return acc;
    }, {} as Record<string, BaseCommand<CommandBuilder>>);
  }

  public static getSlashCommandsCache() {
    return this.commandsCache.reduce((acc, command) => {
      if (command.isSlashCommand()) {
        acc[command.name] = command;
      }
      return acc;
    }, {} as Record<string, BaseSlashCommand>);
  }
}
