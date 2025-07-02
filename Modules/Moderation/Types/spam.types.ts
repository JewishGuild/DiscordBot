import { Snowflake } from "discord.js";

/**
 * Rate limit violation types ordered by severity (most severe first)
 * Each type corresponds to different time windows and message limits
 */
export type ViolationType = "burst" | "rapid" | "sustained";

/**
 * Action severity levels for violations
 */
export type Severity = "high" | "medium" | "low";

/**
 * Recommended actions for violations in order of severity
 */
export type RecommendedAction = "text" | "warn" | "mute";

/**
 * Individual recent message data for spam analysis
 * Stored in a circular buffer of last 10 messages per user
 */
export interface RecentMessage {
  /** Message ID from Discord */
  id: Snowflake;
  /** Unix timestamp when message was sent */
  timestamp: number;
  /** Calculated spam score for this message (0-1 scale) */
  spamScore: number;
}

/**
 * Rate limit violation tracking for each violation type
 * Used to track repeat offenders and escalate punishments
 */
export interface RateLimitViolations {
  /** Most severe: 4+ messages in 2 seconds */
  burst: number;
  /** Medium: 7+ messages in 4 seconds */
  rapid: number;
  /** Least severe: 10+ messages in 10 seconds */
  sustained: number;
  /** Total violations across all types */
  total: number;
}

/**
 * Content violations found in a message during analysis
 * Boolean flags for each type of spam pattern detected
 */
export interface ContentViolations {
  /** Message contains too many URLs */
  tooManyUrls: boolean;
  /** Message contains too many mentions */
  tooManyMentions: boolean;
  /** Message contains too many emojis */
  tooManyEmojis: boolean;
  /** Message is too short or low quality */
  tooShort: boolean;
  /** Message has excessive capital letters */
  tooManyCaps: boolean;
  /** Message has excessive character repetition */
  tooMuchRepetition: boolean;
}

/**
 * Result of analyzing message content for spam patterns
 * Contains both raw metrics and computed spam score
 */
export interface ContentAnalysisResult {
  /** Number of URLs found in message */
  urlCount: number;
  /** Number of mentions found in message */
  mentionCount: number;
  /** Number of emojis found in message (Unicode + Discord custom) */
  emojiCount: number;
  /** Total character length of message (trimmed) */
  messageLength: number;
  /** Number of words in message (whitespace separated) */
  wordCount: number;
  /** Number of unique words in message (case insensitive) */
  uniqueWordCount: number;
  /** Toxicity/offensive content score (0-1 scale) */
  toxicityScore: number;
  /** Confidence in the spam classification (same as spamScore) */
  confidence: number;
  /** Overall spam probability score (0-1 scale) */
  spamScore: number;
  /** Whether message is classified as spam based on threshold */
  isSpam: boolean;
  /** Specific violations found in the message */
  violations: ContentViolations;
  /** Human-readable reasons why message might be spam */
  spamIndicators: string[];
}

/**
 * Rate limit check result with violation details
 * Returned when checking if user has exceeded message rate limits
 */
export interface RateLimitResult {
  /** Whether user is currently rate limited */
  isRateLimited: boolean;
  /** Type of rate limit violation (if any) */
  violationType?: ViolationType;
  /** Severity level of the violation */
  severity?: Severity;
  /** Number of messages in the violated time window */
  messagesInWindow: number;
  /** Time window duration in milliseconds */
  timeWindow: number;
  /** Suggested action to take against the user */
  recommendedAction?: RecommendedAction;
  /** Duration to mute if action is mute (in minutes) */
  muteDuration?: number;
}

/**
 * Complete result of processing a message through spam detection
 * Contains all analysis results and recommended actions
 */
export interface SpamDetectionResult {
  /** Content analysis results */
  contentAnalysis: ContentAnalysisResult;
  /** Rate limiting check results */
  rateLimitCheck: RateLimitResult;
  /** Whether any action should be taken */
  shouldTakeAction: boolean;
  /** Human-readable reason for recommended action */
  actionReason?: string;
  /** Recommended action to take against the user */
  recommendedAction?: RecommendedAction;
}
