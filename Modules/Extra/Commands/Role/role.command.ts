import { ApplicationIntegrationType, ChatInputCommandInteraction, Client, SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "../../../Base/Commands/base.command.js";
import { addSubCommand } from "./add.sub-command.js";
import { removeSubCommand } from "./remove.sub-command.js";

class RoleCommand extends BaseCommand {
  constructor() {
    super();
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
    }
  }

  protected buildData(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("role")
      .setDescription("Special role manager")
      .addSubcommand(addSubCommand.data)
      .addSubcommand(removeSubCommand.data)
      .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]) as SlashCommandBuilder;
  }
}

export const roleCommand = new RoleCommand();
