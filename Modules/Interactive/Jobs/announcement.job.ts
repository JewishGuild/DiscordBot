import { BaseJob } from "../../../Modules/Base/Jobs/base.job.js";
import { Announcement } from "../Types/announcements.types.js";
import { Bot } from "../../../Core/Bot/bot.js";
import { ChannelService } from "../../../Api/Guild/Channel/channel.service.js";
import { Colors, Guild, TextChannel, User } from "discord.js";
import { WebhookUtilities } from "../../../Utilities/webhook.utilities.js";
import { Embed } from "../../../Api/Components/Embed/embed.component.js";
import { MessageService } from "../../../Api/Guild/Channel/TextChannel/Message/message.service.js";
import { AnnouncementService } from "../Services/announcements.service.js";

export class AnnouncementJob extends BaseJob {
  private announcement: Announcement;

  constructor(announcement: Announcement) {
    super(announcement.name, announcement.cycle);
    this.announcement = announcement;
  }

  protected async execute(): Promise<void> {
    const guild = Bot.getInstance().getClient().guilds.cache.first() as Guild;
    const channelService = new ChannelService(guild);

    try {
      // Send new announcement
      const channel = await channelService.getChannelById<TextChannel>(this.announcement.channel);
      const message = await channel.send(this.announcement.message);
      const oldMessageId = this.announcement.messageId;

      // Update new message id
      const announcement = await AnnouncementService.updateAnnouncement(this.announcement.name, message.id);
      this.announcement = announcement as Announcement;

      // Handle old announcement delete
      if (oldMessageId) {
        const messageService = new MessageService(guild, channel);
        await messageService.deleteMessage(oldMessageId);
      }
    } catch {
      WebhookUtilities.log({ embed: this.createErrorEmbed(), user: Bot.getInstance().getClient().user as User, title: "Announcement Failure" });
    }
  }

  private createErrorEmbed() {
    return new Embed({ description: `Error sending announcement message from \`${this.announcement.name}\``, color: Colors.Red }, { color: { state: false } });
  }
}
