import { ChatInputCommandInteraction, ContextMenuCommandInteraction, InteractionEditReplyOptions, Snowflake } from "discord.js";
import { GeneralUtilities } from "./general.utilities.js";
import { Embed } from "../Api/Components/Embed/embed.component.js";

interface InteractionProgressParams {
  resource: string;
  current: number;
  total: number;
  startStamp: number;
}

export class InteractionUtilities {
  public static async fadeReply(interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction, options: InteractionEditReplyOptions) {
    try {
      const message = await interaction.editReply(options);
      await GeneralUtilities.sleep(5000); // wait 5 seconds
      await message.delete();
    } catch {
      // ignore it's fine
    }
  }

  public static async updateProgress(interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction, progress: InteractionProgressParams) {
    try {
      await interaction.editReply({ embeds: [this.createProgressEmbed(progress)] });
    } catch {
      // ignore it's fine
    }
  }

  private static createProgressEmbed({ resource, current, total, startStamp }: InteractionProgressParams) {
    const progressBar = this.createProgressBar(current, total);

    return new Embed({
      description: `
      **${GeneralUtilities.capitalize(resource)}** processed: \`${current}\`/\`${total}\`
      **Duration:** \`${GeneralUtilities.formatTimeDifference(startStamp)}\`

      ${progressBar}
      `
    });
  }

  private static createProgressBar(current: number, total: number, length: number = 20): string {
    if (total === 0) return "▱".repeat(length);

    const percentage = Math.min(current / total, 1);
    const filled = Math.floor(percentage * length);
    const empty = length - filled;

    const filledBar = "▰".repeat(filled);
    const emptyBar = "▱".repeat(empty);
    const percent = Math.round(percentage * 100);

    return `${filledBar}${emptyBar} ${percent}%`;
  }
}
