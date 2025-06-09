import { Snowflake } from "discord.js";
import { BaseCollection } from "../../Base/Models/base.collection.js";
import { Announcement, AnnouncementEntity } from "../Types/announcements.types.js";

export class AnnouncementsCollection extends BaseCollection<AnnouncementEntity> {
  private static instance: AnnouncementsCollection;

  constructor() {
    super("announcements");
  }

  /** Singleton Accessor */
  public static getInstance(): AnnouncementsCollection {
    if (!AnnouncementsCollection.instance) {
      AnnouncementsCollection.instance = new AnnouncementsCollection();
    }
    return AnnouncementsCollection.instance;
  }

  public async insertAnnouncement(entry: Announcement) {
    const existing = await this.getOneByQuery({ name: entry.name });
    if (existing) throw new Error(`There's an existing announcement named ${entry.name}`);
    return this.insert(entry);
  }

  public async editAnnouncement(id: Snowflake, ...args: Partial<Announcement>[]) {
    return this.update({ id }, Object.assign({}, ...args));
  }

  public async removeAnnouncement(name: string) {
    return this.deleteByQuery({ name });
  }

  public async getAllAnnouncements() {
    return this.getByQuery();
  }
}
