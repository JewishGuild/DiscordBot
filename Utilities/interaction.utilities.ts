import { ChatInputCommandInteraction, InteractionEditReplyOptions } from "discord.js";
import { GeneralUtilities } from "./general.utilities.js";

export class InteractionUtilities {
  public static async fadeReply(interaction: ChatInputCommandInteraction, options: InteractionEditReplyOptions) {
    try {
      const message = await interaction.editReply(options);
      await GeneralUtilities.sleep(5000); // wait 5 seconds
      await message.delete();
    } catch {
      // ignore it's fine
    }
  }
}
