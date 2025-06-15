import { MessageCreateOptions, MessagePayload, User } from "discord.js";

export class DirectMessageUtilities {
  public static async sendDM(target: User, options: string | MessagePayload | MessageCreateOptions) {
    const dmChannel = target.dmChannel || (await target.createDM(true));
    try {
      await dmChannel.send(options);
    } catch {
      // Don't care if the message is not sent because it means the user's dms are turned off
    }
  }
}
