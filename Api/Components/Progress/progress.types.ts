export interface ProgressConfig {
  /** The resource being processed (e.g., "channels", "messages", "users") */
  resource: string;
  /** Total items to process */
  total: number;
  /** Custom title for the progress embed */
  title?: string;
  /** Additional context or target information */
  context?: string;
  /** Update frequency in milliseconds (default: 2000ms) */
  updateInterval?: number;
  /** Whether to auto-cleanup on completion (default: true) */
  autoCleanup?: boolean;
  /** Custom emoji for the progress indicator */
  emoji?: string;
  /** Whether to show estimated time remaining */
  showETA?: boolean;
}

export interface ProgressUpdateData {
  /** Current progress count */
  current: number;
  /** Optional status message */
  status?: string;
  /** Additional data to display */
  additionalInfo?: Record<string, string | number>;
}
