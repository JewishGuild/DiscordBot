import { Client, GatewayIntentBits, Partials } from "discord.js";
import { ClientApi } from "../../Api/Client/client.api.js";
import { BaseSlashCommand } from "../../Modules/Base/Commands/base.slash-command.js";

/**
 * Singleton class for managing the Discord bot instance.
 * Handles initialization, login, and command registration.
 */
export class Bot {
  private static instance: Bot;
  private readonly client: Client;
  private readonly clientApi: ClientApi;
  private readonly commands: Map<string, BaseSlashCommand>;

  private constructor() {
    this.client = new Client({ intents: this.getIntents(), partials: this.getPartials() });
    this.clientApi = new ClientApi(this.client);
    this.commands = new Map();
  }

  /**
   * Retrieves the singleton instance of the bot.
   * Ensures only one bot instance exists at runtime.
   *
   * @returns The bot instance.
   */
  public static getInstance(): Bot {
    if (!this.instance) {
      this.instance = new Bot();
    }
    return this.instance;
  }

  /**
   * Initializes the bot, logs in, and prepares command handling.
   */
  public async init(): Promise<void> {
    await this.clientApi.login(process.env.BOT_TOKEN);
  }

  /**
   * Registers a slash command.
   *
   * @param command - The command instance to register.
   */
  public registerSlashCommand(command: BaseSlashCommand): void {
    this.commands.set(command.name, command);
  }

  /**
   * Retrieves the bot's Discord client instance.
   *
   * @returns The Discord.js client.
   */
  public getClient(): Client {
    return this.client;
  }

  /**
   * Retrieves the registered slash commands.
   *
   * @returns A map of command names to command instances.
   */
  public getCommands(): Map<string, BaseSlashCommand> {
    return this.commands;
  }

  /**
   * Defines the required intents for the bot.
   *
   * @returns An array of required intents.
   */
  private getIntents(): GatewayIntentBits[] {
    const { Guilds, GuildMembers, GuildMessages, MessageContent, GuildScheduledEvents, GuildVoiceStates } = GatewayIntentBits;
    return [Guilds, GuildMembers, GuildMessages, MessageContent, GuildScheduledEvents, GuildVoiceStates];
  }

  /**
   * Defines the required partials for the bot.
   *
   * @returns An array of required partials.
   */
  private getPartials(): Partials[] {
    const { User, Message, GuildMember, ThreadMember } = Partials;
    return [User, Message, GuildMember, ThreadMember];
  }
}
