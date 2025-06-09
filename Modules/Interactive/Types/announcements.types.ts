import { Snowflake } from "discord.js";
import { BaseEntity } from "../../Base/Models/base.collection.js";
import { AnnouncementCycle } from "../Config/announcements.config.js";

export type Announcement = {
  creatorId: Snowflake;
  name: string;
  message: string;
  channel: Snowflake;
  cycle: AnnouncementCycle;
  messageId: Snowflake;
};

export type AnnouncementEntity = Announcement & BaseEntity;
