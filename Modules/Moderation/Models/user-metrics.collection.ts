import { Snowflake } from "discord.js";
import { BaseCollection } from "../../Base/Models/base.collection.js";
import { UserMetrics, UserMetricsEntity } from "../Types/user-metrics.types.js";
import { ViolationType, RateLimitViolations } from "../Types/spam.types.js";
import { RateLimiterService } from "../Services/rate-limiter.service.js";

/**
 * Database collection for managing user metrics and spam detection data
 * Extends BaseCollection to provide CRUD operations for user data
 */
export class UserMetricsCollection extends BaseCollection<UserMetricsEntity> {
  private static instance: UserMetricsCollection;

  constructor() {
    super("user-metrics");
  }

  /**
   * Singleton pattern to ensure only one instance exists
   * @returns The singleton instance of UserMetricsCollection
   */
  public static getInstance(): UserMetricsCollection {
    if (!UserMetricsCollection.instance) {
      UserMetricsCollection.instance = new UserMetricsCollection();
    }
    return UserMetricsCollection.instance;
  }

  /**
   * Get user metrics by ID, creating a new entry if user doesn't exist
   * @param id - Discord user ID
   * @returns User metrics object
   */
  public async getUserMetricsById(id: Snowflake): Promise<UserMetrics> {
    const existingUser = await this.getOneByQuery({ id });
    if (existingUser) {
      return existingUser;
    }

    // Create new user with default values
    const now = new Date();
    const newUser: UserMetrics = {
      id,
      joinedAt: now,
      totalMessages: 0,
      warningCount: 0,
      muteDuration: 0,
      lastActivity: now,
      recentMessages: [],
      averageSpamScore: 0,
      rateLimitViolations: {
        burst: 0,
        rapid: 0,
        sustained: 0,
        total: 0
      }
    };

    await this.insert(newUser);
    return newUser;
  }

  /**
   * Record a new message from a user and update their metrics
   * @param userId - Discord user ID
   * @param messageId - Discord message ID
   * @param spamScore - Calculated spam score for the message
   * @param isSpam - Whether the message was flagged as spam
   * @returns Updated user metrics
   */
  public async recordMessage(userId: Snowflake, messageId: Snowflake, spamScore: number, isSpam: boolean = false): Promise<UserMetrics> {
    const user = await this.getUserMetricsById(userId);
    const now = new Date();
    const timestamp = now.getTime();

    // Update recent messages with new message
    const updatedRecentMessages = RateLimiterService.addMessageTimestamp(user.recentMessages, messageId, timestamp, spamScore);

    // Calculate new average spam score
    const newAverageSpamScore = RateLimiterService.calculateAverageSpamScore(updatedRecentMessages);

    // Update user metrics
    const updates: Partial<UserMetrics> = {
      totalMessages: user.totalMessages + 1,
      lastActivity: now,
      recentMessages: updatedRecentMessages,
      averageSpamScore: newAverageSpamScore
    };

    // Set spam flag timestamp if this message is spam
    if (isSpam) {
      updates.lastSpamFlag = now;
    }

    await this.update({ id: userId }, updates);

    // Return updated user data
    return { ...user, ...updates };
  }

  /**
   * Check if user is currently rate limited based on their recent messages
   * @param userId - Discord user ID
   * @returns Rate limit check result
   */
  public async checkRateLimit(userId: Snowflake) {
    const user = await this.getUserMetricsById(userId);
    return RateLimiterService.checkRateLimit(user.recentMessages);
  }

  /**
   * Record a rate limit violation for a user
   * @param userId - Discord user ID
   * @param violationType - Type of rate limit violated
   * @returns Updated user metrics
   */
  public async recordRateLimitViolation(userId: Snowflake, violationType: ViolationType): Promise<UserMetrics> {
    const user = await this.getUserMetricsById(userId);

    // Update violation counts
    const updatedViolations: RateLimitViolations = {
      ...user.rateLimitViolations,
      [violationType]: user.rateLimitViolations[violationType] + 1,
      total: user.rateLimitViolations.total + 1
    };

    const updates: Partial<UserMetrics> = {
      rateLimitViolations: updatedViolations,
      lastActivity: new Date()
    };

    await this.update({ id: userId }, updates);

    // Return updated user data
    return { ...user, ...updates };
  }

  /**
   * Add warning to a user's record
   * @param userId - Discord user ID
   * @param count - Number of warnings to add (default: 1)
   * @returns Updated user metrics
   */
  public async addWarning(userId: Snowflake, count: number = 1): Promise<UserMetrics> {
    const user = await this.getUserMetricsById(userId);

    const updates: Partial<UserMetrics> = {
      warningCount: user.warningCount + count,
      lastActivity: new Date()
    };

    await this.update({ id: userId }, updates);
    return { ...user, ...updates };
  }

  /**
   * Add mute duration to a user's record
   * @param userId - Discord user ID
   * @param durationMinutes - Duration in minutes to add
   * @returns Updated user metrics
   */
  public async addMuteDuration(userId: Snowflake, durationMinutes: number): Promise<UserMetrics> {
    const user = await this.getUserMetricsById(userId);

    const updates: Partial<UserMetrics> = {
      muteDuration: user.muteDuration + durationMinutes,
      lastActivity: new Date()
    };

    await this.update({ id: userId }, updates);
    return { ...user, ...updates };
  }

  /**
   * Get users with high average spam scores (potential spam accounts)
   * @param threshold - Minimum average spam score to consider (default: 0.6)
   * @returns Array of users with high spam scores
   */
  public async getHighSpamUsers(threshold: number = 0.6): Promise<UserMetrics[]> {
    return this.getByQuery({
      averageSpamScore: { $gte: threshold }
    });
  }

  /**
   * Get users with warnings above a threshold
   * @param minWarnings - Minimum number of warnings
   * @returns Array of users with at least the specified warnings
   */
  public async getUsersByWarningCount(minWarnings: number): Promise<UserMetrics[]> {
    return this.getByQuery({
      warningCount: { $gte: minWarnings }
    });
  }

  /**
   * Get users who have been inactive for a specified period
   * @param daysSinceActivity - Number of days since last activity
   * @returns Array of inactive users
   */
  public async getInactiveUsers(daysSinceActivity: number): Promise<UserMetrics[]> {
    const cutoffDate = new Date(Date.now() - daysSinceActivity * 24 * 60 * 60 * 1000);
    return this.getByQuery({
      lastActivity: { $lt: cutoffDate }
    });
  }

  /**
   * Get users flagged for spam recently
   * @param hoursAgo - How many hours ago to check for spam flags (default: 24)
   * @returns Array of users flagged for spam in the time period
   */
  public async getRecentSpamUsers(hoursAgo: number = 24): Promise<UserMetrics[]> {
    const cutoffDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    return this.getByQuery({
      lastSpamFlag: { $gte: cutoffDate }
    });
  }

  /**
   * Get rate limit statistics for a user
   * @param userId - Discord user ID
   * @returns Rate limit statistics object
   */
  public async getRateLimitStats(userId: Snowflake) {
    const user = await this.getUserMetricsById(userId);
    return RateLimiterService.getRateLimitStats(user.recentMessages);
  }

  /**
   * Clean old messages from all users (maintenance function)
   * Removes messages older than 10 seconds to keep recent message arrays clean
   * @returns Number of users updated
   */
  public async cleanOldMessages(): Promise<number> {
    const allUsers = await this.getByQuery({});
    let updatedCount = 0;

    for (const user of allUsers) {
      const cleanedMessages = RateLimiterService.cleanOldMessages(user.recentMessages);

      if (cleanedMessages.length !== user.recentMessages.length) {
        await this.update({ id: user.id }, { recentMessages: cleanedMessages });
        updatedCount++;
      }
    }

    return updatedCount;
  }

  /**
   * Delete users who have been inactive for a specified period
   * @param daysSinceActivity - Days of inactivity threshold
   * @returns Number of users deleted
   */
  public async deleteInactiveUsers(daysSinceActivity: number): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysSinceActivity * 24 * 60 * 60 * 1000);
    const result = await this.deleteByQuery({
      lastActivity: { $lt: cutoffDate }
    });
    return result || 0;
  }

  /**
   * Get summary statistics for all users
   * @returns Object with counts by trust level and other metrics
   */
  public async getStats(): Promise<{
    totalUsers: number;
    averageMessages: number;
    usersWithWarnings: number;
    usersWithRecentSpam: number;
  }> {
    const allUsers = await this.getByQuery({});

    let totalMessages = 0;
    let usersWithWarnings = 0;
    let usersWithRecentSpam = 0;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    for (const user of allUsers) {
      totalMessages += user.totalMessages;

      if (user.warningCount > 0) {
        usersWithWarnings++;
      }

      if (user.lastSpamFlag && user.lastSpamFlag >= oneDayAgo) {
        usersWithRecentSpam++;
      }
    }

    return {
      totalUsers: allUsers.length,
      averageMessages: allUsers.length > 0 ? totalMessages / allUsers.length : 0,
      usersWithWarnings,
      usersWithRecentSpam
    };
  }
}
