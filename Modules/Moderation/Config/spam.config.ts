import { RecommendedAction, Severity, ViolationType } from "../Types/spam.types.js";
import { RestrictionDurations } from "./restriction.config.js";

/** Rate limit configuration for each violation type */
export interface RateLimitConfig {
  name: ViolationType;
  maxMessages: number;
  timeWindow: number;
  severity: Severity;
  action: RecommendedAction;
  muteDuration: number;
}

/**
 * Main spam detection configuration with rate limiting rules and content thresholds
 */
export const SPAM_CONFIG = {
  /** Threshold above which a message is considered spam (0-1 scale) */
  spamThreshold: 0.65,
  /** Tiered rate limits ordered by severity (most restrictive first) */
  rateLimits: [
    {
      name: "burst" as const,
      maxMessages: 4,
      timeWindow: 2000, // 2 seconds
      severity: "high" as const,
      action: "mute" as const,
      muteDuration: RestrictionDurations.OneMinute
    },
    {
      name: "rapid" as const,
      maxMessages: 7,
      timeWindow: 4000, // 4 seconds
      severity: "medium" as const,
      action: "text" as const,
      muteDuration: 0
    },
    {
      name: "sustained" as const,
      maxMessages: 10,
      timeWindow: 10000, // 10 seconds
      severity: "low" as const,
      action: "text" as const,
      muteDuration: 0
    }
  ],
  /** Content analysis thresholds */
  contentThresholds: {
    /** Minimum meaningful message length */
    minMessageLength: 2,
    /** Maximum ratio of capital letters (0-1) */
    maxCapsRatio: 0.8,
    /** Maximum ratio of repeated characters (0-1) */
    maxRepeatCharRatio: 0.5
  },
  /** Pattern detection limits */
  patternLimits: {
    /** Maximum mentions allowed per message */
    maxMentions: 6,
    /** Maximum URLs allowed per message */
    maxUrls: 3,
    /** Maximum emojis allowed per message */
    maxEmojis: 15,
    /** Maximum toxicity allowed per message (0-1) */
    toxicityThreshold: 0.7
  }
} as const;

export enum IgnoredChannels {
  BotCommands = "1369712743887671347",
  Muted = "1371995539276824668"
}

// prettier-ignore
export const badWordSeverity = {
  low: [
    "suck", "sucks", "lame", "noob", "scrub", "ez", "easy", "mad", "salty",
    "טיפש", "מטומטם", "נוב", "טרול", "freier", "tipesh", "metumtam"
  ],
  medium: [
    "stupid", "idiot", "dumb", "trash", "loser", "pathetic", "damn", "hell", "crap",
    "אידיוט", "דביל", "חמור", "משוגע", "idiot", "devil", "hamor", "meshuga", "מפגר"
  ],
  high: [
    "fuck", "shit", "bitch", "asshole", "hate", "kill", "die", "retard",
    "חרא", "זין", "בן זונה", "זונה", "hara", "zayin", "ben zona", "zona"
  ],
  critical: [
    "kys", "kill yourself", "suicide", "faggot", "nigger", "rape",
    "כוס", "שרמוטה", "תמות", "לך תמות", "kus", "sharmuta", "tamot", "lech tamot"
  ]
};

/**
 * Flattened array of all bad words for quick lookup
 */
export const BAD_WORDS = [...badWordSeverity.low, ...badWordSeverity.medium, ...badWordSeverity.high, ...badWordSeverity.critical] as const;

/**
 * Get severity score for a specific word (0-10 scale)
 * @param word - The word to check
 * @returns Severity score: 0 (clean), 3 (low), 6 (medium), 8 (high), 10 (critical)
 */
export function getWordSeverity(word: string): number {
  const lowerWord = word.toLowerCase();

  if (badWordSeverity.critical.some((w) => lowerWord.includes(w.toLowerCase()))) return 10;
  if (badWordSeverity.high.some((w) => lowerWord.includes(w.toLowerCase()))) return 8;
  if (badWordSeverity.medium.some((w) => lowerWord.includes(w.toLowerCase()))) return 6;
  if (badWordSeverity.low.some((w) => lowerWord.includes(w.toLowerCase()))) return 3;

  return 0;
}

/**
 * Analyze content for toxic words and calculate toxicity metrics
 */
export function analyzeToxicity(content: string): {
  /** Overall toxicity score (0-1 scale) */
  toxicityScore: number;
  /** List of detected toxic words */
  detectedWords: string[];
  /** Highest severity word found (0-10 scale) */
  maxSeverity: number;
  /** Average severity of all detected words */
  averageSeverity: number;
} {
  const lowerContent = content.toLowerCase();
  const detectedWords: string[] = [];
  let totalSeverity = 0;
  let maxSeverity = 0;

  // Check each word in our bad words list
  for (const word of BAD_WORDS) {
    if (lowerContent.includes(word.toLowerCase())) {
      detectedWords.push(word);
      const severity = getWordSeverity(word);
      totalSeverity += severity;
      maxSeverity = Math.max(maxSeverity, severity);
    }
  }

  const averageSeverity = detectedWords.length > 0 ? totalSeverity / detectedWords.length : 0;

  // Calculate toxicity score: based on number of words and maximum severity
  const toxicityScore = Math.min(detectedWords.length / 3 + maxSeverity / 10, 1);

  return {
    toxicityScore,
    detectedWords,
    maxSeverity,
    averageSeverity
  };
}
