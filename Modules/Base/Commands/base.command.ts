import {
  Client,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ContextMenuCommandBuilder,
  UserContextMenuCommandInteraction,
  MessageContextMenuCommandInteraction,
  CommandInteraction,
  ApplicationCommandType
} from "discord.js";
import { ConsoleUtilities } from "../../../Utilities/console.utilities.js";

export type CommandCategory = "moderation" | "extra" | "info" | "interactive";

/** Union type for all possible command builders. */
export type CommandBuilder = SlashCommandBuilder | ContextMenuCommandBuilder;

/** Enhanced base class supporting all Discord Application Command types. */
export abstract class BaseCommand<T extends CommandBuilder> {
  public readonly data: T;
  public readonly name: string;
  public readonly category: CommandCategory;
  public readonly type: ApplicationCommandType;
  protected readonly logger: ConsoleUtilities;

  /** Initializes a new command with specified category. */
  constructor(category: CommandCategory) {
    this.data = this.buildData();
    this.name = this.data.name;
    this.category = category;
    this.type = this.getCommandType();
    this.logger = new ConsoleUtilities("Command", `${this.getTypeString()}:${this.name}`);
  }

  /** Abstract factory method for command builder construction. */
  protected abstract buildData(): T;

  public abstract execute(client: Client, interaction: CommandInteraction): Promise<void>;

  /** Type extraction utility - determines the ApplicationCommandType from the builder. */
  private getCommandType(): ApplicationCommandType {
    if (this.data instanceof SlashCommandBuilder) {
      return ApplicationCommandType.ChatInput;
    } else if (this.data instanceof ContextMenuCommandBuilder) {
      return (this.data as any).type || ApplicationCommandType.User;
    }
    return ApplicationCommandType.ChatInput;
  }

  /** Readable command type string for logging purposes. */
  private getTypeString(): string {
    switch (this.type) {
      case ApplicationCommandType.ChatInput:
        return "SLASH";
      case ApplicationCommandType.User:
        return "USER_CONTEXT";
      case ApplicationCommandType.Message:
        return "MESSAGE_CONTEXT";
      default:
        return "UNKNOWN";
    }
  }

  /** Type guard utility to check if this is a slash command. */
  public isSlashCommand(): this is BaseSlashCommand {
    return this.type === ApplicationCommandType.ChatInput;
  }

  /** Type guard utility to check if this is a user context command. */
  public isUserContextCommand(): this is BaseUserContextCommand {
    return this.type === ApplicationCommandType.User;
  }

  /** Type guard utility to check if this is a message context command. */
  public isMessageContextCommand(): this is BaseMessageContextCommand {
    return this.type === ApplicationCommandType.Message;
  }
}

/** Specialized base class for Slash Commands. */
export abstract class BaseSlashCommand extends BaseCommand<SlashCommandBuilder> {
  protected buildData(): SlashCommandBuilder {
    return this.createSlashCommand();
  }
  /** Factory method for creating slash command builders. */
  protected abstract createSlashCommand(): SlashCommandBuilder;
  public abstract execute(client: Client, interaction: ChatInputCommandInteraction): Promise<void>;
}

/** Specialized base class for User Context Menu Commands. */
export abstract class BaseUserContextCommand extends BaseCommand<ContextMenuCommandBuilder> {
  protected buildData(): ContextMenuCommandBuilder {
    return this.createUserContextCommand().setType(ApplicationCommandType.User);
  }
  /** Factory method for creating user context command builders. */
  protected abstract createUserContextCommand(): ContextMenuCommandBuilder;
  public abstract execute(client: Client, interaction: UserContextMenuCommandInteraction): Promise<void>;
}

/** Specialized base class for Message Context Menu Commands. */
export abstract class BaseMessageContextCommand extends BaseCommand<ContextMenuCommandBuilder> {
  protected buildData(): ContextMenuCommandBuilder {
    return this.createMessageContextCommand().setType(ApplicationCommandType.Message);
  }
  /** Factory method for creating message context command builders. */
  protected abstract createMessageContextCommand(): ContextMenuCommandBuilder;
  public abstract execute(client: Client, interaction: MessageContextMenuCommandInteraction): Promise<void>;
}
