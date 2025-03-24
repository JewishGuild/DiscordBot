import { Client, ClientApplication } from "discord.js";
import { ClientApi } from "../client.api.js";

/**
 * API for managing the Discord bot application.
 * Extends {@link ClientApi} to provide additional functionality related to the bot's application instance.
 */
export class ApplicationApi extends ClientApi {
  /** The Discord bot application instance. @see {@link ClientApplication} */
  protected readonly clientApplication: ClientApplication;

  /**
   * Initializes the Application API with the given bot client.
   *
   * @param client - The Discord {@link Client} instance.
   */
  constructor(client: Client) {
    super(client);
    this.clientApplication = client.application!;
  }
}
