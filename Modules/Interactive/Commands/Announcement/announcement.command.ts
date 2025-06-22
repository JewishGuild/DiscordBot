import { ApplicationIntegrationType, ChatInputCommandInteraction, Client, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "../../../Base/Commands/base.command.js";
import { addSubCommand } from "./add.sub-command.js";
import { removeSubCommand } from "./remove.sub-command.js";
import { listSubCommand } from "./list.sub-command.js";
import { editSubCommand } from "./edit.sub-command.js";
import { previewSubCommand } from "./preview.sub-command.js";

class AnnouncementCommand extends BaseCommand {
  constructor() {
    super("interactive");
  }

  public async execute(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

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
      case "edit":
        await editSubCommand.execute(client, interaction);
        break;
      case "preview":
        await previewSubCommand.execute(client, interaction);
    }
  }

  protected buildData(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("announcement")
      .setDescription("Announcement manager")
      .addSubcommand(addSubCommand.data)
      .addSubcommand(removeSubCommand.data)
      .addSubcommand(listSubCommand.data)
      .addSubcommand(editSubCommand.data)
      .addSubcommand(previewSubCommand.data)
      .setDefaultMemberPermissions(PermissionFlagsBits.CreateEvents)
      .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]) as SlashCommandBuilder;
  }
}

export const announcementCommand = new AnnouncementCommand();
