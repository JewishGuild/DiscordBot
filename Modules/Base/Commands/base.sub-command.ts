import { Client, ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { ConsoleUtilities } from "../../../Utilities/console.utilities.js";

/**
 * Base class for Discord commands.
 * Provides structured logging and enforces command execution rules.
 */
export abstract class BaseSubCommand {
  /** The command metadata defined using {@link SlashCommandSubcommandBuilder}. */
  public readonly data: SlashCommandSubcommandBuilder;

  /** The name of the command, extracted from {@link SlashCommandSubcommandBuilder}. */
  public readonly name: string;

  /** Logger instance for structured command logging using {@link ConsoleUtilities}. */
  protected readonly logger: ConsoleUtilities;

  /** Initializes a new command. */
  constructor() {
    this.data = this.buildData();
    this.name = this.data.name;
    this.logger = new ConsoleUtilities("Command", this.name);
  }

  /**
   * Constructs the `CommandBuilder` for the command.
   * Must be implemented by subclasses.
   *
   * @returns A configured {@link SlashCommandSubcommandBuilder} instance.
   */
  protected abstract buildData(): SlashCommandSubcommandBuilder;

  /**
   * Executes the command. Must be implemented by subclasses.
   *
   * @param client - The Discord bot instance from {@link Client}.
   * @param interaction - The command interaction instance from {@link ChatInputCommandInteraction}.
   */
  public abstract execute(client: Client, interaction: ChatInputCommandInteraction): Promise<void>;
}
