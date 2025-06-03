import { Snowflake } from "discord.js";
import { BaseEntity } from "../../Base/Models/base.collection.js";

export type Warning = {
  id: Snowflake;
  moderatorId: Snowflake;
  reason: string;
  timestamp: number;
};

export type WarningEntry = Warning & BaseEntity;
