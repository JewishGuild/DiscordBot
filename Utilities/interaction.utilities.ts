import { ChatInputCommandInteraction, InteractionReplyOptions, MessagePayload } from "discord.js";
import { GeneralUtilities } from "./general.utilities.js";

export class InteractionUtilities {
  public static async fadeReply(interaction: ChatInputCommandInteraction, options: string | MessagePayload | InteractionReplyOptions) {
    const message = await interaction.reply(options);
    await GeneralUtilities.sleep(3000); // wait 2 seconds
    await message.delete(); //
  }
}
