import { Message } from "discord.js";
import { SPAM_CONFIG, analyzeToxicity } from "../Config/spam.config.js";
import { ContentAnalysisResult, ContentViolations } from "../Types/spam.types.js";

/**
 * Service for analyzing Discord message content to detect spam patterns
 * Uses pattern matching and heuristic analysis to identify potential spam
 */
export class ContentAnalyzerService {
  /** Analyze a Discord message for spam patterns and violations */
  public static analyzeMessage(message: Message): ContentAnalysisResult {
    const content = message.content;

    // Count basic patterns in the message
    const patterns = this.countPatterns(content);

    // Check for specific violations against our rules
    const violations = this.checkViolations(patterns, content);

    // Generate human-readable spam indicators
    const spamIndicators = this.generateSpamIndicators(violations, patterns);

    // Calculate numerical scores
    const scores = this.calculateScores(content, violations);

    // Make final spam determination
    const isSpam = scores.spamScore > SPAM_CONFIG.spamThreshold;

    return {
      urlCount: patterns.urlCount,
      mentionCount: patterns.mentionCount,
      emojiCount: patterns.emojiCount,
      messageLength: patterns.messageLength,
      wordCount: patterns.wordCount,
      uniqueWordCount: patterns.uniqueWordCount,
      violations,
      spamIndicators,
      spamScore: scores.spamScore,
      toxicityScore: scores.toxicityScore,
      isSpam,
      confidence: scores.spamScore
    };
  }

  /** Enhanced analyzer with full content access for production use */
  public static analyzeMessageEnhanced(message: Message): ContentAnalysisResult {
    // Use the main analyze method which now includes all functionality
    return this.analyzeMessage(message);
  }

  /** Count various patterns in message content */
  private static countPatterns(content: string): {
    urlCount: number;
    mentionCount: number;
    emojiCount: number;
    messageLength: number;
    wordCount: number;
    uniqueWordCount: number;
  } {
    // Count URLs (http/https links)
    const urlCount = (content.match(/https?:\/\/[^\s]+/g) || []).length;

    // Count mentions (@user, @role, @everyone, @here)
    const mentionCount = (content.match(/<@[!&]?\d+>|@everyone|@here/g) || []).length;

    // Count emojis (Unicode + Discord custom)
    const emojiCount = this.countEmojis(content);

    // Message length and word analysis
    const messageLength = content.trim().length;

    // Remove emoji patterns before counting words to avoid double-counting
    const contentWithoutEmojis = content
      .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, "") // Unicode emojis
      .replace(/<a?:\w+:\d+>/g, "") // Discord custom emojis
      .replace(/:\w+[~\d]*:/g, ""); // Text emojis like :smile:

    const words = contentWithoutEmojis
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    const wordCount = words.length;
    const uniqueWords = new Set(words.map((word) => word.toLowerCase()));
    const uniqueWordCount = uniqueWords.size;

    return {
      urlCount,
      mentionCount,
      emojiCount,
      messageLength,
      wordCount,
      uniqueWordCount
    };
  }

  /** Count emojis in message (Unicode + Discord custom) */
  private static countEmojis(content: string): number {
    // Unicode emojis (common emoji ranges)
    const unicodeEmojis = content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || [];

    // Discord custom emojis (<:name:id> or <a:name:id> for animated)
    const discordEmojis = content.match(/<a?:\w+:\d+>/g) || [];

    return unicodeEmojis.length + discordEmojis.length;
  }

  /** Check message patterns against violation thresholds */
  private static checkViolations(
    patterns: {
      urlCount: number;
      mentionCount: number;
      emojiCount: number;
      messageLength: number;
      wordCount: number;
      uniqueWordCount: number;
    },
    content: string
  ): ContentViolations {
    return {
      tooManyUrls: patterns.urlCount > SPAM_CONFIG.patternLimits.maxUrls,
      tooManyMentions: patterns.mentionCount > SPAM_CONFIG.patternLimits.maxMentions,
      tooManyEmojis: patterns.emojiCount > SPAM_CONFIG.patternLimits.maxEmojis,
      tooShort: this.isMessageTooShort(patterns.messageLength, patterns.wordCount, patterns.uniqueWordCount),
      tooManyCaps: this.hasTooManyCaps(content),
      tooMuchRepetition: this.hasTooMuchRepetition(content)
    };
  }

  /** Determine if message is too short or low quality, considers both character length and word diversity */
  private static isMessageTooShort(messageLength: number, wordCount: number, uniqueWordCount: number): boolean {
    // Basic length check
    if (messageLength < SPAM_CONFIG.contentThresholds.minMessageLength) {
      return true;
    }

    // No meaningful words (emoji-only messages)
    if (wordCount === 0) {
      return true;
    }

    // Repeated single word spam (e.g., "hello hello hello hello")
    if (wordCount >= 3 && uniqueWordCount === 1) {
      return true;
    }

    // Low word diversity (many repeated words)
    const wordDiversity = uniqueWordCount / wordCount;
    if (wordCount >= 4 && wordDiversity < 0.3) {
      return true;
    }

    return false;
  }

  /** Check if message has excessive capital letters */
  private static hasTooManyCaps(content: string): boolean {
    const letters = content.replace(/[^a-zA-Z]/g, "");
    if (letters.length <= 10) return false; // Skip very short messages

    const capsCount = (content.match(/[A-Z]/g) || []).length;
    const capsRatio = capsCount / letters.length;

    return capsRatio > SPAM_CONFIG.contentThresholds.maxCapsRatio;
  }

  /** Check if message has excessive character repetition */
  private static hasTooMuchRepetition(content: string): boolean {
    if (content.length === 0) return false;

    let repeatedChars = 0;
    let currentChar = "";
    let currentCount = 0;

    for (const char of content.toLowerCase()) {
      if (char === currentChar) {
        currentCount++;
        if (currentCount > 2) {
          repeatedChars++;
        }
      } else {
        currentChar = char;
        currentCount = 1;
      }
    }

    const repeatRatio = repeatedChars / content.length;
    return repeatRatio > SPAM_CONFIG.contentThresholds.maxRepeatCharRatio;
  }

  /** Generate human-readable spam indicators based on violations */
  private static generateSpamIndicators(
    violations: ContentViolations,
    patterns: {
      urlCount: number;
      mentionCount: number;
      emojiCount: number;
      messageLength: number;
      wordCount: number;
      uniqueWordCount: number;
    }
  ): string[] {
    const indicators: string[] = [];

    if (violations.tooManyUrls) {
      indicators.push(`Too many URLs (${patterns.urlCount}/${SPAM_CONFIG.patternLimits.maxUrls})`);
    }

    if (violations.tooManyMentions) {
      indicators.push(`Too many mentions (${patterns.mentionCount}/${SPAM_CONFIG.patternLimits.maxMentions})`);
    }

    if (violations.tooManyEmojis) {
      indicators.push(`Too many emojis (${patterns.emojiCount}/${SPAM_CONFIG.patternLimits.maxEmojis})`);
    }

    if (violations.tooShort) {
      if (patterns.wordCount === 0) {
        indicators.push("No meaningful words (emoji-only message)");
      } else if (patterns.uniqueWordCount === 1 && patterns.wordCount >= 3) {
        indicators.push(`Repeated word spam (${patterns.wordCount} repetitions)`);
      } else {
        indicators.push(`Low quality content (${patterns.messageLength} chars)`);
      }
    }

    if (violations.tooManyCaps) {
      indicators.push("Excessive capital letters");
    }

    if (violations.tooMuchRepetition) {
      indicators.push("Excessive character repetition");
    }

    return indicators;
  }

  /** Calculate spam and toxicity scores based on violations and content */
  private static calculateScores(
    content: string,
    violations: ContentViolations
  ): {
    spamScore: number;
    toxicityScore: number;
  } {
    let spamScore = 0;

    // Add weighted penalties for each violation type
    if (violations.tooManyUrls) spamScore += 0.3;
    if (violations.tooManyMentions) spamScore += 0.4;
    if (violations.tooManyEmojis) spamScore += 0.25;
    if (violations.tooShort) spamScore += 0.4;
    if (violations.tooManyCaps) spamScore += 0.3;
    if (violations.tooMuchRepetition) spamScore += 0.3;

    // Calculate toxicity score using the config function
    const toxicityAnalysis = analyzeToxicity(content);
    const toxicityScore = toxicityAnalysis.toxicityScore;

    // Add toxicity penalty to spam score if above threshold
    if (toxicityScore > SPAM_CONFIG.patternLimits.toxicityThreshold) {
      spamScore += 0.2;
    }

    // Ensure spam score doesn't exceed 1.0
    return {
      spamScore: Math.min(spamScore, 1.0),
      toxicityScore
    };
  }
}
