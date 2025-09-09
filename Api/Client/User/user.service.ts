import { Client, Snowflake } from "discord.js";
import { UserApi } from "./user.api.js";

export class UserService extends UserApi {
  constructor(client: Client) {
    super(client);
  }

  public async resolveUserById(id: Snowflake) {
    const user = await this.getUserById(id);
    if (!user) throw new Error("Invalid, user is not found.");
    return user;
  }
}
