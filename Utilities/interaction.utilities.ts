import { ChatInputCommandInteraction, InteractionReplyOptions, MessagePayload } from "discord.js";
import { GeneralUtilities } from "./general.utilities.js";

export class InteractionUtilities {
  public static async fadeReply(interaction: ChatInputCommandInteraction, options: string | MessagePayload | InteractionReplyOptions) {
    try {
      const message = await interaction.reply(options);
      await GeneralUtilities.sleep(15000); // wait 15 seconds
      await message.delete();
    } catch {
      // ignore it's fine
    }
  }
}
