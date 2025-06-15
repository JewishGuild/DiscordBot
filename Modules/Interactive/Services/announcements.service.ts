import { AnnouncementsCollection } from "../Models/announcements.collection.js";
import { RootJob } from "../../../Core/Server/root.job.js";
import { AnnouncementJob } from "../Jobs/announcement.job.js";
import { Announcement } from "../Types/announcements.types.js";
import { Snowflake } from "discord.js";

export class AnnouncementService {
  public static async startAllAnnouncements() {
    const announcements = await AnnouncementsCollection.getInstance().getAllAnnouncements();
    announcements.map((announcement) => RootJob.addJob(new AnnouncementJob(announcement)));
  }

  public static async insertAnnouncement({ creatorId, channel, cycle, message, name, messageId }: Announcement) {
    const announcement: Announcement = {
      creatorId,
      channel,
      cycle,
      message,
      name,
      messageId
    };

    await AnnouncementsCollection.getInstance().insert(announcement);
    RootJob.addJob(new AnnouncementJob(announcement));
  }

  public static async updateAnnouncement(name: string, messageId: Snowflake) {
    return AnnouncementsCollection.getInstance().update({ name }, { messageId });
  }

  public static async removeAnnouncement(name: string) {
    const removedFlag = await AnnouncementsCollection.getInstance().removeAnnouncement(name);

    if (removedFlag) {
      RootJob.removeJob(name);
    }
    return Boolean(removedFlag);
  }

  public static async editAnnouncement(name: string, ...args: Partial<Announcement>[]) {
    const announcement = (await AnnouncementsCollection.getInstance().editAnnouncement(name, ...args)) as Announcement;
    if (!announcement) throw new Error("Announcement not found");

    RootJob.removeJob(name);
    RootJob.addJob(new AnnouncementJob(announcement));
  }

  public static async getAllAnnouncements() {
    return await AnnouncementsCollection.getInstance().getAllAnnouncements();
  }
}
