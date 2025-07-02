import { Client, Message, Snowflake } from "discord.js";
import { ContentAnalyzerService } from "./content-analyzer.service.js";
import { UserMetricsCollection } from "../Models/user-metrics.collection.js";
import { SpamDetectionResult } from "../Types/spam.types.js";
import { UserMetrics } from "../Types/user-metrics.types.js";

/**
 * Main spam detection service that coordinates all spam detection systems
 * This is the primary entry point for processing messages and detecting spam
 */
export class SpamDetectionService {
  private static userMetrics: UserMetricsCollection;

  /**
   * Initialize the service with the user metrics collection
   */
  private static ensureInitialized(): void {
    if (!this.userMetrics) {
      this.userMetrics = UserMetricsCollection.getInstance();
    }
  }

  /**
   * Main entry point: process a Discord message through spam detection
   * This method coordinates both rate limiting and content analysis
   *
   * @param client - Discord client instance
   * @param message - Discord message to process
   * @returns Complete spam detection result with recommended actions
   */
  public static async processMessage(client: Client, message: Message): Promise<SpamDetectionResult> {
    this.ensureInitialized();

    const userId = message.author.id as Snowflake;

    try {
      // Get user metrics (creates user if doesn't exist)
      const user = await this.userMetrics.getUserMetricsById(userId);

      // Method 1: Check rate limits based on message timestamps
      const rateLimitCheck = await this.userMetrics.checkRateLimit(userId);

      if (rateLimitCheck.isRateLimited) {
        // Record the rate limit violation
        if (rateLimitCheck.violationType) {
          await this.userMetrics.recordRateLimitViolation(userId, rateLimitCheck.violationType);
        }

        return {
          contentAnalysis: {
            urlCount: 0,
            mentionCount: 0,
            emojiCount: 0,
            messageLength: 0,
            wordCount: 0,
            uniqueWordCount: 0,
            toxicityScore: 0,
            confidence: 0,
            spamScore: 0,
            isSpam: false,
            violations: {
              tooManyUrls: false,
              tooManyMentions: false,
              tooManyEmojis: false,
              tooShort: false,
              tooManyCaps: false,
              tooMuchRepetition: false
            },
            spamIndicators: []
          },
          rateLimitCheck,
          shouldTakeAction: true,
          actionReason: `Rate limit exceeded: ${rateLimitCheck.messagesInWindow} messages in ${rateLimitCheck.timeWindow! / 1000}s`,
          recommendedAction: rateLimitCheck.recommendedAction
        };
      }

      // Method 2: Analyze message content for spam patterns
      const contentAnalysis = ContentAnalyzerService.analyzeMessage(message);

      // Record the message in user metrics
      await this.userMetrics.recordMessage(userId, message.id, contentAnalysis.spamScore, contentAnalysis.isSpam);

      // Check if user's average spam score is high (Method 2 trigger)
      const updatedUser = await this.userMetrics.getUserMetricsById(userId);
      const highSpamAverage = updatedUser.averageSpamScore > 0.7;

      // Determine if action should be taken
      const shouldTakeAction = contentAnalysis.isSpam || highSpamAverage;

      let actionReason: string | undefined;
      let recommendedAction: "text" | "warn" | "mute" | undefined;

      if (contentAnalysis.isSpam) {
        actionReason = `Spam content detected: ${contentAnalysis.spamIndicators.join(", ")}`;
        recommendedAction = this.getContentSpamAction(contentAnalysis.spamScore);
      } else if (highSpamAverage) {
        actionReason = `High average spam score: ${(updatedUser.averageSpamScore * 100).toFixed(1)}%`;
        recommendedAction = "text";
      }

      return {
        contentAnalysis,
        rateLimitCheck,
        shouldTakeAction,
        actionReason,
        recommendedAction
      };
    } catch (error) {
      // Return safe error state
      return {
        contentAnalysis: {
          urlCount: 0,
          mentionCount: 0,
          emojiCount: 0,
          messageLength: 0,
          wordCount: 0,
          uniqueWordCount: 0,
          toxicityScore: 0,
          confidence: 0,
          spamScore: 0,
          isSpam: false,
          violations: {
            tooManyUrls: false,
            tooManyMentions: false,
            tooManyEmojis: false,
            tooShort: false,
            tooManyCaps: false,
            tooMuchRepetition: false
          },
          spamIndicators: []
        },
        rateLimitCheck: {
          isRateLimited: false,
          messagesInWindow: 0,
          timeWindow: 0
        },
        shouldTakeAction: false
      };
    }
  }

  /**
   * Determine appropriate action based on content spam score
   * @param spamScore - Calculated spam score (0-1)
   * @returns Recommended moderation action
   */
  private static getContentSpamAction(spamScore: number): "text" | "warn" | "mute" {
    // Simple thresholds without trust level consideration
    if (spamScore > 0.9) return "mute";
    //if (spamScore > 0.7) return "warn";
    return "text";
  }

  /**
   * Get user metrics and spam statistics
   * @param userId - Discord user ID
   * @returns User metrics object or null if not found
   */
  public static async getUserMetrics(userId: Snowflake): Promise<UserMetrics | null> {
    this.ensureInitialized();
    return await this.userMetrics.getUserMetricsById(userId);
  }

  /**
   * Manually add warning to a user
   * @param userId - Discord user ID
   * @param count - Number of warnings to add (default: 1)
   * @returns Updated user metrics or null if error
   */
  public static async addWarning(userId: Snowflake, count: number = 1): Promise<UserMetrics | null> {
    this.ensureInitialized();
    return await this.userMetrics.addWarning(userId, count);
  }

  /**
   * Manually add mute duration to a user
   * @param userId - Discord user ID
   * @param durationMinutes - Duration in minutes
   * @returns Updated user metrics or null if error
   */
  public static async addMuteDuration(userId: Snowflake, durationMinutes: number): Promise<UserMetrics | null> {
    this.ensureInitialized();
    return await this.userMetrics.addMuteDuration(userId, durationMinutes);
  }

  /**
   * Get users with high spam scores that need attention
   * @param threshold - Minimum average spam score (default: 0.6)
   * @returns Array of users needing moderation attention
   */
  public static async getUsersNeedingAttention(threshold: number = 0.6): Promise<UserMetrics[]> {
    this.ensureInitialized();
    return await this.userMetrics.getHighSpamUsers(threshold);
  }

  /**
   * Get users flagged for spam in recent hours
   * @param hoursAgo - How many hours ago to check (default: 24)
   * @returns Array of recently flagged users
   */
  public static async getRecentSpamUsers(hoursAgo: number = 24): Promise<UserMetrics[]> {
    this.ensureInitialized();
    return await this.userMetrics.getRecentSpamUsers(hoursAgo);
  }

  /**
   * Get overall statistics for all users
   * @returns Summary statistics object
   */
  public static async getStats() {
    this.ensureInitialized();
    return await this.userMetrics.getStats();
  }
}
