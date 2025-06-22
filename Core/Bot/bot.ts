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
  private loginTimestamp!: number;

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
    this.loginTimestamp = Date.now();

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
   * Retrieves the bot's login time stamp.
   *
   * @returns The bot's login time stamp.
   */
  public getLoginTimestamp(): number {
    return this.loginTimestamp;
  }

  /**
   * Calculates the bot's uptime.
   *
   * @returns The bot's uptime formatted duration.
   */
  public getUptime() {
    const uptimeMs = Date.now() - this.loginTimestamp;

    const totalSeconds = Math.floor(uptimeMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const days = Math.floor(totalHours / 24);

    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;
    const seconds = totalSeconds % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(" ");
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
