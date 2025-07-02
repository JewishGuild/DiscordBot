import { Snowflake } from "discord.js";
import { SPAM_CONFIG } from "../Config/spam.config.js";
import { RateLimitResult, RecentMessage, ViolationType, Severity, RecommendedAction } from "../Types/spam.types.js";

/**
 * Rate limiting service for detecting message spam based on timing patterns
 * Tracks message timestamps and detects violations of rate limit rules
 */
export class RateLimiterService {
  /**
   * Check if user has exceeded any rate limits based on recent message timestamps
   * @param recentMessages - Array of recent messages with timestamps
   * @returns Rate limit check result with violation details
   */
  public static checkRateLimit(recentMessages: RecentMessage[]): RateLimitResult {
    const now = Date.now();

    // Check each rate limit tier (most severe first)
    for (const rateLimit of SPAM_CONFIG.rateLimits) {
      const windowStart = now - rateLimit.timeWindow;
      const messagesInWindow = recentMessages.filter((message) => message.timestamp > windowStart).length;

      // Check if this rate limit is violated
      if (messagesInWindow >= rateLimit.maxMessages) {
        return {
          isRateLimited: true,
          violationType: rateLimit.name as ViolationType,
          severity: rateLimit.severity as Severity,
          messagesInWindow,
          timeWindow: rateLimit.timeWindow,
          recommendedAction: rateLimit.action as RecommendedAction,
          muteDuration: rateLimit.muteDuration
        };
      }
    }

    // No rate limit violations
    return {
      isRateLimited: false,
      messagesInWindow: recentMessages.length,
      timeWindow: 0
    };
  }

  /**
   * Add a new message timestamp to the recent messages array
   * Maintains a circular buffer of the last 10 messages
   * @param recentMessages - Current array of recent messages
   * @param messageId - Discord message ID
   * @param timestamp - Message timestamp (defaults to now)
   * @param spamScore - Spam score for this message (defaults to 0)
   * @returns Updated recent messages array
   */
  public static addMessageTimestamp(
    recentMessages: RecentMessage[],
    messageId: Snowflake,
    timestamp: number = Date.now(),
    spamScore: number = 0
  ): RecentMessage[] {
    const newMessage: RecentMessage = {
      id: messageId,
      timestamp,
      spamScore
    };

    // Add new message and keep only last 10
    const updatedMessages = [...recentMessages, newMessage].slice(-10);

    return updatedMessages;
  }

  /**
   * Calculate average spam score from recent messages
   * @param recentMessages - Array of recent messages with spam scores
   * @returns Average spam score (0-1 scale), or 0 if no messages
   */
  public static calculateAverageSpamScore(recentMessages: RecentMessage[]): number {
    if (recentMessages.length === 0) {
      return 0;
    }

    const totalScore = recentMessages.reduce((sum, message) => sum + message.spamScore, 0);
    return totalScore / recentMessages.length;
  }

  /**
   * Get rate limit statistics for debugging purposes
   * @param recentMessages - Array of recent messages
   * @returns Object with message counts for each time window
   */
  public static getRateLimitStats(recentMessages: RecentMessage[]): {
    last2Seconds: number;
    last4Seconds: number;
    last10Seconds: number;
    total: number;
  } {
    const now = Date.now();

    return {
      last2Seconds: recentMessages.filter((m) => m.timestamp > now - 2000).length,
      last4Seconds: recentMessages.filter((m) => m.timestamp > now - 4000).length,
      last10Seconds: recentMessages.filter((m) => m.timestamp > now - 10000).length,
      total: recentMessages.length
    };
  }

  /**
   * Clean old messages from recent messages array (older than 10 seconds)
   * Useful for periodic cleanup to prevent memory buildup
   * @param recentMessages - Array of recent messages
   * @returns Cleaned array with only recent messages
   */
  public static cleanOldMessages(recentMessages: RecentMessage[]): RecentMessage[] {
    const tenSecondsAgo = Date.now() - 10000;
    return recentMessages.filter((message) => message.timestamp > tenSecondsAgo);
  }
}
