import { MessageCreateOptions, MessagePayload, User } from "discord.js";

export class DirectMessageUtilities {
  public static async sendDM(target: User, options: string | MessagePayload | MessageCreateOptions) {
    if (process.env.NODE_ENV === "stage") return;

    let informed = false;
    try {
      const dmChannel = target.dmChannel || (await target.createDM(true));
      await dmChannel.send(options);
      informed = true;
    } catch {
      return informed;
    } finally {
      return informed;
    }
  }
}
