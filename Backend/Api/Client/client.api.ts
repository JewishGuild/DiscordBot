import { Client } from "discord.js";

/**
 * Wrapper class for managing the Discord bot client.
 * This class provides an abstraction for interacting with the {@link Client} instance,
 * allowing for controlled access to bot operations such as login.
 */
export class ClientApi {
  /** The Discord bot client instance. @see {@link Client} */
  protected readonly client: Client;

  /**
   * Initializes the Client API with a given Discord bot client.
   *
   * @param client - The Discord {@link Client} instance to be managed.
   */
  constructor(client: Client) {
    this.client = client;
  }

  /**
   * Logs the bot into Discord using the provided token.
   *
   * @param token - The Discord bot token used for authentication.
   */
  public async login(token: string): Promise<void> {
    await this.client.login(token);
  }
}
