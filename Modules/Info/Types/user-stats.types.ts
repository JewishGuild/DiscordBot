import { Snowflake } from "discord.js";
import { BaseEntity } from "../../Base/Models/base.collection";

export type UserStats = {
  // global data
  id: Snowflake;
  nicknames?: Array<string>;
  boosted?: boolean;
  warnCount?: number;
  muteCount?: number;
  reportsCount?: number;
  falseReportsCount?: number;
  muteDurationCount?: number;
  joins?: Array<number>;
  leaves?: Array<number>;
  lastChatActivity?: number;
  lastVoiceActivity?: number;

  // state
  isMember?: boolean;
  isAdmin?: boolean;
  isStaff?: boolean;
  isBooster?: boolean;
  isMuted?: boolean;
};

export type ArrayUserStats = "nicknames" | "joins" | "leaves";
export type IncrementalUserStats = "warnCount" | "muteCount" | "muteDurationCount" | "falseReportsCount" | "reportsCount";
export type NonGenericUserStats = "id" | ArrayUserStats | IncrementalUserStats;
export type GenericUserStats = Omit<UserStats, NonGenericUserStats>;

export type UserStatsEntity = UserStats & BaseEntity;
