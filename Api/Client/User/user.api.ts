import { Client, Snowflake, UserManager } from "discord.js";
import { ClientApi } from "../client.api.js";

/**
 * API for managing the Discord bot users.
 * Extends {@link ClientApi} to provide additional functionality related to the bot's application instance.
 */
export class UserApi extends ClientApi {
  /** The Discord bot user manager instance. @see {@link UserManager} */
  protected readonly userManager: UserManager;

  /**
   * Initializes the Users API with the given bot client.
   *
   * @param client - The Discord {@link Client} instance.
   */
  constructor(client: Client) {
    super(client);
    this.userManager = client.users;
  }

  public async getUserById(id: Snowflake) {
    return this.userManager.fetch(id);
  }
}
