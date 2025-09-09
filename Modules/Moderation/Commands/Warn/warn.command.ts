import { ApplicationIntegrationType, ChatInputCommandInteraction, Client, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { BaseSlashCommand } from "../../../Base/Commands/base.command.js";
import { addSubCommand } from "./add.sub-command.js";
import { removeSubCommand } from "./remove.sub-command.js";
import { listSubCommand } from "./list.sub-command.js";
import { UserStatsService } from "../../../Info/Services/user-stats.service.js";

class WarnCommand extends BaseSlashCommand {
  constructor() {
    super("moderation");
  }

  public async execute(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const isCommanderStaff = await UserStatsService.isStaffMember({ guild: interaction.guild, id: interaction.user.id });
    if (!isCommanderStaff) throw new Error("You're not a staff member");

    /* Handle subcommands */
    switch (interaction.options.getSubcommand()) {
      case "add":
        await addSubCommand.execute(client, interaction);
        break;
      case "remove":
        await removeSubCommand.execute(client, interaction);
        break;
      case "list":
        await listSubCommand.execute(client, interaction);
        break;
    }
  }

  protected createSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("warn")
      .setDescription("Warning manager")
      .addSubcommand(addSubCommand.data)
      .addSubcommand(removeSubCommand.data)
      .addSubcommand(listSubCommand.data)
      .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
      .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]) as SlashCommandBuilder;
  }
}

export const warnCommand = new WarnCommand();
