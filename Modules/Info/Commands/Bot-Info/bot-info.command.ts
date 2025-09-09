import { ApplicationIntegrationType, ChatInputCommandInteraction, Client, SlashCommandBuilder } from "discord.js";
import { BaseSlashCommand } from "../../../Base/Commands/base.command.js";
import { commandsSubCommand } from "./commands.sub-command.js";
import { generalSubCommand } from "./general.sub-command.js";

class BotInfoCommand extends BaseSlashCommand {
  constructor() {
    super("info");
  }

  public async execute(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    /* Handle subcommands */
    switch (interaction.options.getSubcommand()) {
      case "commands":
        await commandsSubCommand.execute(client, interaction);
        break;
      case "general":
        await generalSubCommand.execute(client, interaction);
        break;
    }
  }

  protected createSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("info")
      .setDescription("Information regarding the bot")
      .addSubcommand(commandsSubCommand.data)
      .addSubcommand(generalSubCommand.data)
      .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]) as SlashCommandBuilder;
  }
}

export const botInfoCommand = new BotInfoCommand();
