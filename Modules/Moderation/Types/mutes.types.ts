import { Snowflake } from "discord.js";
import { BaseEntity } from "../../Base/Models/base.collection.js";

export type MutedMember = {
  id: Snowflake;
  moderatorId: Snowflake;
  reason: string;
  timestamp: number;
  duration: number;
  permanent: boolean;
  roles: Array<Snowflake>;
};

export type MutedMemberEntity = MutedMember & BaseEntity;
