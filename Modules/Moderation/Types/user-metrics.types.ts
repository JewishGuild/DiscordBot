import { Snowflake } from "discord.js";
import { BaseEntity } from "../../Base/Models/base.collection.js";
import { RateLimitViolations, RecentMessage } from "./spam.types.js";

/**
 * Core user metrics for spam detection and user behavior tracking
 * Central data structure that gets stored in the database
 */
export interface UserMetrics {
  /** Discord user ID */
  id: Snowflake;
  /** When user was first tracked by the system */
  joinedAt: Date;
  /** Total messages sent by user (lifetime counter) */
  totalMessages: number;
  /** Number of warnings issued to user by moderators */
  warningCount: number;
  /** Total time muted in minutes (cumulative) */
  muteDuration: number;
  /** Timestamp of last activity (updated on every message) */
  lastActivity: Date;
  /** Last 10 messages with their spam scores for trend analysis */
  recentMessages: RecentMessage[];
  /** Average spam score calculated from recent messages (0-1 scale) */
  averageSpamScore: number;
  /** Rate limit violation counts by type */
  rateLimitViolations: RateLimitViolations;
  /** When user was last flagged for spam content (undefined if never) */
  lastSpamFlag?: Date;
}

export type UserMetricsEntity = UserMetrics & BaseEntity;
