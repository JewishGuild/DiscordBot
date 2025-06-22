import { Client, ChatInputCommandInteraction, SlashCommandSubcommandBuilder, APIEmbedField, APIApplicationCommandOptionChoice } from "discord.js";
import { BaseSubCommand } from "../../Base/Commands/base.sub-command.js";
import { Embed } from "../../../Api/Components/Embed/embed.component.js";
import { BaseCommand, CommandCategory } from "../../Base/Commands/base.command.js";
import { RootCommand } from "../../../Core/Bot/root.command.js";
import { GeneralUtilities } from "../../../Utilities/general.utilities.js";

const categoryOptions: Array<APIApplicationCommandOptionChoice<CommandCategory>> = [
  { name: "Moderation", value: "moderation" },
  { name: "Interactive", value: "interactive" },
  { name: "Extra", value: "extra" }
];

class CommandsSubCommand extends BaseSubCommand {
  public async execute(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
    const commandsCache = RootCommand.getCommandsCache();
    const commands: Array<APIEmbedField> = [];
    const category = interaction.options.getString("category") as CommandCategory;

    for (const name in commandsCache) {
      // skip "info" command
      const command = commandsCache[name];
      if (name === "info") continue;
      if (category && category !== command.category) continue;

      if (this.isParentCommand(command)) {
        for (const option of command.data.options) {
          const formattedOption = option.toJSON();
          commands.push({ name: `${name} ${formattedOption.name}`, value: formattedOption.description });
        }
      } else {
        commands.push({ name, value: command.data.description });
      }
    }

    const embed = this.constructEmbed(commands, category);
    const { embed: paginatedEmbed, needsPagination, components } = embed.createPaginated(5);
    const message = await interaction.reply({ embeds: [paginatedEmbed], components });

    if (needsPagination) {
      await paginatedEmbed.startPagination(message);
    }
  }

  protected buildData(): SlashCommandSubcommandBuilder {
    return new SlashCommandSubcommandBuilder()
      .setName("commands")
      .setDescription("Commands list")
      .addStringOption((category) => category.setName("category").setDescription("Commands category").addChoices(categoryOptions));
  }

  private constructEmbed(commands: Array<APIEmbedField>, category: CommandCategory) {
    const initial = category ? GeneralUtilities.capitalize(category) + " " : "";

    return new Embed(
      { title: initial + "Commands List", description: "List of the commands and subcommands", fields: commands, timestamp: Date.now() },
      {
        footer: { state: true },
        thumbnail: { state: true }
      }
    );
  }

  private isParentCommand(command: BaseCommand) {
    if (command.data.options.some((option) => option instanceof SlashCommandSubcommandBuilder)) return true;
    return false;
  }
}

export const commandsSubCommand = new CommandsSubCommand();
