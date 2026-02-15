import { APIAttachment, Snowflake } from "discord.js";
import { BaseEntity } from "../../Base/Models/base.collection.js";

export type BaseReport = {
  reporterId: Snowflake;
  targetId: Snowflake;

  reportedMessageId: Snowflake;
  reportedMessageUrl: string;
  reportDetail: string;
  content: string;
  attachments: Array<APIAttachment>;
};

export type ReportAction = "neutral" | "false" | "delete" | "warn" | "perma";

export type Report = BaseReport & {
  resolved: boolean;
  resolvedBy: Snowflake;
  false?: boolean;
  action?: ReportAction;
};

export type ReportEntity = Report & BaseEntity;
