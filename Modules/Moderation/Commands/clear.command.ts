import {
  ApplicationIntegrationType,
  ChatInputCommandInteraction,
  Client,
  Collection,
  Colors,
  Message,
  PartialMessage,
  PermissionFlagsBits,
  SlashCommandBuilder,
  Snowflake,
  TextChannel
} from "discord.js";
import { BaseSlashCommand } from "../../Base/Commands/base.command.js";
import { Embed } from "../../../Api/Components/Embed/embed.component.js";
import { InteractionUtilities } from "../../../Utilities/interaction.utilities.js";
import { LoggerUtilities } from "../../../Utilities/logger.utilities.js";
import { UserStatsService } from "../../Info/Services/user-stats.service.js";

class ClearCommand extends BaseSlashCommand {
  constructor() {
    super("moderation", false);
  }

  public async execute(client: Client, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const isCommanderStaff = await UserStatsService.isStaffMember({ guild: interaction.guild, id: interaction.user.id });
    if (!isCommanderStaff) throw new Error("You're not a staff member");

    /* Get selected options */
    const amount = interaction.options.getNumber("amount", true);

    /* Bulk delete messages */
    const channel = interaction.channel as TextChannel;
    const response = await channel.bulkDelete(amount);

    /* Handle reply */
    await interaction.deferReply();
    InteractionUtilities.fadeReply(interaction, { embeds: [this.constructEmbed(amount)] });
    LoggerUtilities.log({ title: "Messages Cleared", embed: this.constructLogEmbed(amount, channel.id, response), user: interaction.user });
  }

  private constructEmbed(amount: number) {
    return new Embed({ color: Colors.Green, description: `✅ Deleted ${amount} messages` }, { color: { state: false } });
  }

  private constructLogEmbed(amount: number, id: Snowflake, response: Collection<Snowflake, Message | PartialMessage | undefined>) {
    let messages = "";
    let totalAttachments = 0;

    const messagesArray = response.reverse();

    for (const [, message] of messagesArray) {
      if (message instanceof Message) {
        let messageContent = `[${message.author.username}]: ${message.content}`;

        if (message.attachments && message.attachments.size > 0) {
          const attachmentCount = message.attachments.size;
          totalAttachments += attachmentCount;

          const attachmentList = message.attachments
            .map((attachment) => {
              // Enhanced file size calculation with better precision
              const sizeInBytes = attachment.size;
              const sizeInKB = Math.round((sizeInBytes / 1024) * 100) / 100;
              const sizeInMB = Math.round((sizeInBytes / (1024 * 1024)) * 100) / 100;
              const sizeInGB = Math.round((sizeInBytes / (1024 * 1024 * 1024)) * 100) / 100;

              // Determine optimal size display using logarithmic scaling
              let displaySize: string;
              if (sizeInBytes >= 1024 * 1024 * 1024) {
                displaySize = `${sizeInGB} GB`;
              } else if (sizeInBytes >= 1024 * 1024) {
                displaySize = `${sizeInMB} MB`;
              } else if (sizeInBytes >= 1024) {
                displaySize = `${sizeInKB} KB`;
              } else {
                displaySize = `${sizeInBytes} B`;
              }

              // Enhanced markdown link with file type indicator
              return `${this.getFileTypeEmoji(attachment.name)} [**${attachment.name}**](${attachment.url}) (${displaySize})`;
            })
            .join("\n    ");

          messageContent += `\n    ${attachmentList}`;
        }

        if (message.embeds && message.embeds.length > 0) {
          const embedCount = message.embeds.length;
          messageContent += `\n    🔗 ${embedCount} embed${embedCount > 1 ? "s" : ""}`;
        }

        messages += messageContent + "\n";
      }
    }

    if (totalAttachments) messages += "\n💡 Click attachment names to view/download files.\n⏰ *Discord deletes most files after deletion due to expiry.*";

    return new Embed(
      {
        color: Colors.Green,
        description: `Deleted ${amount} messages in channel <#${id}>\n\n**__Message List:__**\n\n${messages}`
      },
      { color: { state: false } }
    );
  }

  // Enhanced file type detection
  private getFileTypeEmoji(filename: string): string {
    const extension = filename.split(".").pop()?.toLowerCase();

    // prettier-ignore
    const emojiMap: Record<string, string> = {
      // Images
      'png': '🖼️', 'jpg': '🖼️', 'jpeg': '🖼️', 'gif': '🖼️', 'webp': '🖼️',
      // Videos
      'mp4': '🎥', 'mov': '🎥', 'avi': '🎥', 'mkv': '🎥', 'webm': '🎥',
      // Audio
      'mp3': '🎵', 'wav': '🎵', 'flac': '🎵', 'ogg': '🎵',
      // Documents
      'pdf': '📄', 'doc': '📄', 'docx': '📄', 'txt': '📄',
      // Archives
      'zip': '📦', 'rar': '📦', '7z': '📦', 'tar': '📦',
      // Code
      'js': '📜', 'ts': '📜', 'py': '📜', 'java': '📜', 'cpp': '📜'
    };

    return emojiMap[extension || ""] || "📎";
  }

  protected createSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName("clear")
      .setDescription("Deletes 1-100 messages")
      .addNumberOption((amount) => amount.setName("amount").setDescription("Amount of messages to delete").setRequired(true).setMinValue(1).setMaxValue(100))
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
      .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]) as SlashCommandBuilder;
  }
}

export const clearCommand = new ClearCommand();
