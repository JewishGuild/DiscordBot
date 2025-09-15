import { MessageCreateOptions, MessagePayload, User } from "discord.js";

export class DirectMessageUtilities {
  public static async sendDM(target: User, options: string | MessagePayload | MessageCreateOptions) {
    let informed = false;
    try {
      const dmChannel = target.dmChannel || (await target.createDM(true));
      await dmChannel.send(options);
      informed = true;
    } catch {
      // Don't care if the message is not sent because it means the user's dms are turned off
    } finally {
      return informed;
    }
  }
}
