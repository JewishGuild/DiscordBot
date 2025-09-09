import { Client, ChatInputCommandInteraction, SlashCommandSubcommandBuilder, APIEmbedField, APIApplicationCommandOptionChoice } from "discord.js";
import { BaseSubCommand } from "../../../Base/Commands/base.sub-command.js";
import { Embed } from "../../../../Api/Components/Embed/embed.component.js";
import { BaseSlashCommand, CommandCategory } from "../../../Base/Commands/base.command.js";
import { RootCommand } from "../../../../Core/Bot/root.command.js";
import { GeneralUtilities } from "../../../../Utilities/general.utilities.js";
import { GroupedCommands } from "../../Types/info.types.js";

// Constants
const CATEGORY_OPTIONS: Array<APIApplicationCommandOptionChoice<string>> = [
  { name: "Moderation", value: "moderation" },
  { name: "Interactive", value: "interactive" },
  { name: "Extra", value: "extra" }
];
const CATEGORY_ORDER: Array<CommandCategory> = ["moderation", "interactive", "extra", "info"];
const ITEMS_PER_PAGE = 5;

class CommandsSubCommand extends BaseSubCommand {
  public async execute(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
    const category = interaction.options.getString("category") as CommandCategory | null;
    const commands = category ? this.getCommandsByCategory(category) : this.getAllCommandsGrouped();

    const embed = this.constructEmbed(commands, category);
    const { embed: paginatedEmbed, needsPagination, components } = embed.createPaginated(ITEMS_PER_PAGE);
    const message = await interaction.editReply({ embeds: [paginatedEmbed], components });

    if (needsPagination) {
      await paginatedEmbed.startPagination(message, interaction.user.id);
    }
  }

  protected buildData(): SlashCommandSubcommandBuilder {
    return new SlashCommandSubcommandBuilder()
      .setName("commands")
      .setDescription("Commands list")
      .addStringOption((category) => category.setName("category").setDescription("Commands category").addChoices(CATEGORY_OPTIONS));
  }

  private constructEmbed(commands: Array<APIEmbedField>, category: CommandCategory | null): Embed {
    const titlePrefix = category ? `${GeneralUtilities.capitalize(category)} ` : "";

    return new Embed(
      {
        title: `${titlePrefix}Commands List`,
        description: "List of the commands and subcommands",
        fields: commands,
        timestamp: Date.now()
      },
      {
        footer: { state: true },
        thumbnail: { state: true }
      }
    );
  }

  private isParentCommand(command: BaseSlashCommand) {
    return command.data.options.some((option) => option instanceof SlashCommandSubcommandBuilder);
  }

  private getCommandsByCategory(category: CommandCategory): Array<APIEmbedField> {
    const commandsCache = RootCommand.getSlashCommandsCache();
    const commands: Array<APIEmbedField> = [];

    for (const [name, command] of Object.entries(commandsCache)) {
      if (this.shouldSkipCommand(command, category)) continue;
      commands.push(...this.extractCommandFields(name, command));
    }

    return commands;
  }

  private getAllCommandsGrouped(): Array<APIEmbedField> {
    const commandsCache = RootCommand.getSlashCommandsCache();
    const groupedCommands = this.initializeGroupedCommands();

    // Group commands by category
    for (const [name, command] of Object.entries(commandsCache)) {
      if (this.shouldSkipCommand(command)) continue;

      const commandFields = this.extractCommandFields(name, command);
      const category = command.category;

      if (this.isValidCategory(category)) {
        groupedCommands[category].push(...commandFields);
      }
    }

    // Build final array with headers and spacers
    return this.buildFormattedCommandList(groupedCommands);
  }

  private buildFormattedCommandList(groupedCommands: GroupedCommands): Array<APIEmbedField> {
    const commands: Array<APIEmbedField> = [];

    for (const category of CATEGORY_ORDER) {
      const categoryCommands = groupedCommands[category];
      if (categoryCommands.length === 0) continue;

      // Add category header
      commands.push(this.createCategoryHeader(category));

      // Add commands
      commands.push(...categoryCommands);

      // Fill out the rest of the page
      const currentLength = commands.length;
      for (let i = 0; i < ITEMS_PER_PAGE - (currentLength % ITEMS_PER_PAGE); i++) {
        commands.push(this.createSpacer());
      }
    }

    // Fill remaining slots on the last page
    this.fillLastPage(commands);
    return commands;
  }

  private extractCommandFields(name: string, command: BaseSlashCommand): Array<APIEmbedField> {
    if (this.isParentCommand(command)) {
      return command.data.options.map((option) => {
        const formattedOption = option.toJSON();
        return {
          name: `${name} ${formattedOption.name}`,
          value: formattedOption.description || "No description available"
        };
      });
    }

    return [
      {
        name,
        value: command.data.description || "No description available"
      }
    ];
  }

  private shouldSkipCommand(command: BaseSlashCommand, category?: CommandCategory): boolean {
    if (category && category !== command.category) return true;
    return false;
  }

  private initializeGroupedCommands(): GroupedCommands {
    return CATEGORY_ORDER.reduce((acc, cat) => {
      acc[cat] = [];
      return acc;
    }, {} as GroupedCommands);
  }

  private isValidCategory(category: CommandCategory): category is CommandCategory {
    return CATEGORY_ORDER.includes(category);
  }

  private createCategoryHeader(category: CommandCategory) {
    return {
      name: GeneralUtilities.capitalize(category),
      value: "ㅤ"
    };
  }

  private createSpacer() {
    return {
      name: "ㅤ",
      value: "ㅤ"
    };
  }

  private fillLastPage(commands: Array<APIEmbedField>): void {
    const remainder = commands.length % ITEMS_PER_PAGE;
    if (remainder === 0) return;

    const fillersNeeded = ITEMS_PER_PAGE - remainder;
    for (let i = 0; i < fillersNeeded; i++) {
      commands.push(this.createSpacer());
    }
  }
}

export const commandsSubCommand = new CommandsSubCommand();
