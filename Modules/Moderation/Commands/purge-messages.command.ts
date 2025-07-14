import {
  ApplicationIntegrationType,
  Client,
  Collection,
  ContextMenuCommandBuilder,
  GuildMember,
  Message,
  Snowflake,
  TextChannel,
  ThreadChannel,
  UserContextMenuCommandInteraction
} from "discord.js";
import { BaseUserContextCommand } from "../../Base/Commands/base.command.js";
import { ChannelService } from "../../../Api/Guild/Channel/channel.service.js";
import { GeneralUtilities } from "../../../Utilities/general.utilities.js";
import { Embed } from "../../../Api/Components/Embed/embed.component.js";
import { InteractionUtilities } from "../../../Utilities/interaction.utilities.js";
import { LoggerUtilities } from "../../../Utilities/logger.utilities.js";
import { WorkerQueue } from "../../../Utilities/worker-queue.utilities.js";
import { StaffService } from "../Services/staff.service.js";

interface PurgeResult {
  startStamp: number;
  messageCount: number;
  channelCount: number;
}

class PurgeMessages extends BaseUserContextCommand {
  constructor() {
    super("moderation");
  }

  public async execute(client: Client, interaction: UserContextMenuCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    if (!StaffService.isStaffMember(interaction.member as GuildMember)) throw new Error("You're not a support staff member.");

    // Get all needed data
    const targetId = interaction.targetId;
    const channelService = new ChannelService(interaction.guild);
    const textChannels = await channelService.getAllPublicTextChannels();
    const result: PurgeResult = { startStamp: Date.now(), messageCount: 0, channelCount: 0 };

    // Run all channels
    const queue = new WorkerQueue<TextChannel>(
      GeneralUtilities.collectionToArray(textChannels),
      async (channel) => await this.deleteMessagesFromChannel(channel, targetId, result),
      20
    );
    await queue.run();

    // Submit results
    const embed = this.constructEmbed(targetId, interaction.user.id, result);
    InteractionUtilities.fadeReply(interaction, { embeds: [embed] });
    LoggerUtilities.log({ title: "Purged Messages", embed, user: interaction.user });
  }

  private async deleteMessagesFromChannel(channel: TextChannel | ThreadChannel, userId: Snowflake, result: PurgeResult) {
    let deleted = false;
    let lastMessageId: string | undefined;
    let messagesCount = 0;
    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    let consecutiveEmptyBatches = 0;

    while (true) {
      // Fetch messages by paginated batches
      const messages = await channel.messages.fetch({ limit: 100, before: lastMessageId });
      if (messages.size === 0) break;

      // Check if we've gone past the 1-week cutoff
      const oldestMessageInBatch = messages.last();
      if (oldestMessageInBatch && oldestMessageInBatch.createdTimestamp < oneWeekAgo) {
        // Delete all messages from batch
        const userMessages = messages.filter((msg) => msg.author.id === userId);
        if (userMessages.size > 0) {
          await this.deleteMessages(channel, userMessages, twoWeeksAgo, result);
          messagesCount += userMessages.size;
          deleted = true;
        }
        break; // Stop searching this channel - we've reached the 1-week limit
      }

      // Filter user messages from current batch
      const userMessages = messages.filter((msg) => msg.author.id === userId);
      if (userMessages.size === 0) {
        consecutiveEmptyBatches++;

        // Break because irrelevant
        if (consecutiveEmptyBatches >= 5) {
          break;
        }
      } else {
        consecutiveEmptyBatches = 0;
        await this.deleteMessages(channel, userMessages, twoWeeksAgo, result);
        messagesCount += userMessages.size;
        deleted = true;
      }

      lastMessageId = messages.last()?.id; // Next pagination page
    }

    if (deleted) {
      result.channelCount++;
    }
  }

  private async deleteMessages(channel: TextChannel | ThreadChannel, messages: Collection<string, Message<true>>, twoWeeksAgo: number, result: PurgeResult) {
    const newMessages = messages.filter((msg) => msg.createdTimestamp > twoWeeksAgo);
    const oldMessages = messages.filter((msg) => msg.createdTimestamp <= twoWeeksAgo);

    // Bulk delete new messages (within 2 weeks - Discord API requirement)
    if (newMessages.size > 0) {
      await channel.bulkDelete(newMessages);
      result.messageCount += newMessages.size;
    }

    const messageChunks = GeneralUtilities.chunkArray(Array.from(oldMessages.values()), 10);
    for (const chunk of messageChunks) {
      await Promise.allSettled(chunk.map((message) => message.delete()));
      result.messageCount += chunk.length;
    }
  }

  protected createUserContextCommand(): ContextMenuCommandBuilder {
    return new ContextMenuCommandBuilder().setName("Purge Messages").setIntegrationTypes([ApplicationIntegrationType.GuildInstall]);
  }

  private constructEmbed(targetId: Snowflake, modId: Snowflake, { startStamp, messageCount, channelCount }: PurgeResult) {
    return new Embed({
      description: `<@${targetId}>'s messages have been purged by <@${modId}>
      Deleted \`${messageCount}\` messages in \`${channelCount}\` channels.
      Process duration: \`${GeneralUtilities.formatTimeDifference(startStamp)}\``
    });
  }
}

export const purgeMessages = new PurgeMessages();
