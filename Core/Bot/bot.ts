import { Client, GatewayIntentBits, Partials } from "discord.js";
import { ClientApi } from "../../Api/Client/client.api.js";
import { RootEvent } from "./root.event.js";
import { RootCommand } from "./root.command.js";

/**
 * Singleton class for managing the Discord bot instance.
 * Handles initialization, login, and command registration.
 */
export class Bot {
  private static instance: Bot;
  private readonly client: Client<true>;
  private readonly clientApi: ClientApi;

  private constructor() {
    this.client = new Client({ intents: this.getIntents(), partials: this.getPartials() });
    this.clientApi = new ClientApi(this.client);
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

    RootEvent.init(this.client);
    await RootCommand.init(this.client);

    this.client.user.setStatus("online");
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
   * Defines the required intents for the bot.
   *
   * @returns An array of required intents.
   */
  private getIntents(): GatewayIntentBits[] {
    const { Guilds, GuildMembers, GuildMessages, MessageContent, GuildVoiceStates } = GatewayIntentBits;
    return [Guilds, GuildMembers, GuildMessages, MessageContent, GuildVoiceStates];
  }

  /**
   * Defines the required partials for the bot.
   *
   * @returns An array of required partials.
   */
  private getPartials(): Partials[] {
    const { User, Message, GuildMember } = Partials;
    return [User, Message, GuildMember];
  }
}
