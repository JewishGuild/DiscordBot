import { Client } from "discord.js";
import { BaseCommand, BaseSlashCommand, CommandBuilder } from "../../Modules/Base/Commands/base.command.js";
import { ConsoleUtilities } from "../../Utilities/console.utilities.js";
import { CommandApi } from "../../Api/Client/Application/Commands/commands.api.js";
import { muteCommand } from "../../Modules/Moderation/Commands/mute.command.js";
import { unmuteCommand } from "../../Modules/Moderation/Commands/unmute.command.js";
import { warnCommand } from "../../Modules/Moderation/Commands/Warn/warn.command.js";
import { clearCommand } from "../../Modules/Moderation/Commands/clear.command.js";
import { announcementCommand } from "../../Modules/Interactive/Commands/Announcement/announcement.command.js";
import { roleCommand } from "../../Modules/Extra/Commands/Role/role.command.js";
import { botInfoCommand } from "../../Modules/Info/Commands/Bot-Info/bot-info.command.js";
import { permanentMuteCommand } from "../../Modules/Moderation/Commands/permanent-mute.command.js";
import { purgeMessages } from "../../Modules/Moderation/Commands/purge-messages.command.js";
import { memberInfoCommand } from "../../Modules/Info/Commands/member-info.command.js";
import { reportMessageCommand } from "../../Modules/Moderation/Commands/report-message.js";

/**
 * Centralized commands manager that registers all commands dynamically.
 */
export class RootCommand {
  private static readonly logger = new ConsoleUtilities("Command", "Root");
  private static commandsCache: Array<BaseCommand<CommandBuilder>> = [
    muteCommand,
    unmuteCommand,
    warnCommand,
    clearCommand,
    announcementCommand,
    roleCommand,
    botInfoCommand,
    permanentMuteCommand,
    purgeMessages,
    memberInfoCommand,
    reportMessageCommand
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
