import { APIAttachment, Snowflake } from "discord.js";
import { BaseEntity } from "../../Base/Models/base.collection.js";

export type BaseReport = {
  reporterId: Snowflake;
  targetId: Snowflake;

  reportedMessageId: Snowflake;
  reportedMessageUrl: string;
  content: string;
  attachments: Array<APIAttachment>;
};

export type Report = BaseReport & {
  resolved: boolean;
  resolvedBy: Snowflake;
};

export type ReportEntity = Report & BaseEntity;
