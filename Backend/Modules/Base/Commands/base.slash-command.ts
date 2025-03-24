import { Client, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { ConsoleUtilities } from "../../../Utilities/console.utilities.js";

/**
 * Base class for Discord slash commands.
 * Provides structured logging and enforces command execution rules.
 */
export abstract class BaseSlashCommand {
  /** The command metadata defined using {@link SlashCommandBuilder}. */
  public readonly data: SlashCommandBuilder;

  /** The name of the command, extracted from {@link SlashCommandBuilder}. */
  public readonly name: string;

  /** Logger instance for structured command logging using {@link ConsoleUtilities}. */
  protected readonly logger: ConsoleUtilities;

  /** Initializes a new slash command. */
  constructor() {
    this.data = this.buildData();
    this.name = this.data.name;
    this.logger = new ConsoleUtilities("SlashCommand", this.name);
  }

  /**
   * Constructs the `SlashCommandBuilder` for the command.
   * Must be implemented by subclasses.
   *
   * @returns A configured {@link SlashCommandBuilder} instance.
   */
  protected abstract buildData(): SlashCommandBuilder;

  /**
   * Executes the slash command. Must be implemented by subclasses.
   *
   * @param client - The Discord bot instance from {@link Client}.
   * @param interaction - The command interaction instance from {@link ChatInputCommandInteraction}.
   */
  public abstract execute(client: Client, interaction: ChatInputCommandInteraction): Promise<void>;
}
