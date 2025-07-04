import { ChatInputCommandInteraction, ContextMenuCommandInteraction, Message } from "discord.js";
import { ProgressConfig, ProgressUpdateData } from "./progress.types.js";
import { GeneralUtilities } from "../../../Utilities/general.utilities.js";
import { Embed } from "../Embed/embed.component.js";

export class Progress {
  private config: Required<ProgressConfig>;
  private progressMessage: Message | null = null;
  private interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction;
  private startTime: number;
  private lastUpdateTime: number = 0;
  private updateHistory: Array<{ time: number; current: number }> = [];

  constructor(interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction, config: ProgressConfig) {
    this.interaction = interaction;
    this.startTime = Date.now();
    this.config = {
      resource: config.resource,
      total: config.total,
      title: config.title || `Processing ${GeneralUtilities.capitalize(config.resource)}`,
      context: config.context || "",
      updateInterval: config.updateInterval || 2000,
      autoCleanup: config.autoCleanup ?? true,
      emoji: config.emoji || "🔄",
      showETA: config.showETA ?? true
    };
  }

  /**
   * Initializes the progress tracker by sending the initial progress message.
   * Must be called after interaction.deferReply().
   */
  public async start(initialStatus: string = "Starting..."): Promise<void> {
    try {
      this.progressMessage = await this.interaction.followUp({
        embeds: [this.createProgressEmbed(0, initialStatus)],
        flags: "Ephemeral"
      });
      this.recordProgress(0);
    } catch (error) {
      console.error("Failed to start progress tracker:", error);
    }
  }

  /**
   * Updates the progress with throttling to avoid rate limits.
   * Uses intelligent update frequency based on progress velocity.
   */
  public async update(data: ProgressUpdateData): Promise<void> {
    const now = Date.now();
    const { current, status, additionalInfo } = data;

    // Record progress for ETA calculation
    this.recordProgress(current);

    // Throttle updates based on configured interval
    if (now - this.lastUpdateTime < this.config.updateInterval) {
      return;
    }

    // Always update on completion or significant milestones
    const isComplete = current >= this.config.total;
    const isMilestone = current > 0 && current % Math.max(1, Math.floor(this.config.total / 10)) === 0;

    if (!isComplete && !isMilestone && now - this.lastUpdateTime < this.config.updateInterval) {
      return;
    }

    this.lastUpdateTime = now;

    if (!this.progressMessage) return;

    try {
      const embed = this.createProgressEmbed(current, status, additionalInfo);
      await this.progressMessage.edit({ embeds: [embed] });
    } catch (error) {
      // Ignore rate limit errors on progress updates
    }
  }

  /**
   * Marks the operation as complete and optionally cleans up the progress message.
   */
  public async complete(completionMessage?: string): Promise<void> {
    if (this.config.autoCleanup && this.progressMessage) {
      try {
        await this.progressMessage.delete();
      } catch {
        // Message might already be deleted
      }
    } else if (this.progressMessage) {
      // Update to show completion
      const embed = this.createCompletionEmbed(completionMessage);
      try {
        await this.progressMessage.edit({ embeds: [embed] });
      } catch {}
    }
  }

  /**
   * Force update regardless of throttling (useful for important status changes).
   */
  public async forceUpdate(data: ProgressUpdateData): Promise<void> {
    this.lastUpdateTime = 0; // Reset throttle
    await this.update(data);
  }

  /**
   * Creates the progress embed with all visual indicators.
   */
  private createProgressEmbed(current: number, status?: string, additionalInfo?: Record<string, string | number>): Embed {
    const progressBar = this.createProgressBar(current, this.config.total);
    const percentage = Math.min((current / this.config.total) * 100, 100);
    const duration = GeneralUtilities.formatTimeDifference(this.startTime);

    let description = `${this.config.emoji} **${this.config.title}**\n\n`;

    if (this.config.context) {
      description += `${this.config.context}\n\n`;
    }

    if (status) {
      description += `**Status:** ${status}\n`;
    }

    description += `**Progress:** \`${current}\`/\`${this.config.total}\` (${Math.round(percentage)}%)\n`;
    description += `**Duration:** \`${duration}\`\n`;

    // Add ETA if enabled and we have enough data
    if (this.config.showETA && this.updateHistory.length > 1) {
      const eta = this.calculateETA(current);
      if (eta) {
        description += `**ETA:** \`${eta}\`\n`;
      }
    }

    description += `\n${progressBar}`;

    // Add additional info if provided
    if (additionalInfo && Object.keys(additionalInfo).length > 0) {
      description += `\n\n**Additional Info:**\n`;
      Object.entries(additionalInfo).forEach(([key, value]) => {
        description += `• **${GeneralUtilities.capitalize(key)}:** \`${value}\`\n`;
      });
    }

    return new Embed({
      description,
      color: current >= this.config.total ? 0x00ff00 : 0xffa500,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Creates a completion embed when the operation finishes.
   */
  private createCompletionEmbed(message?: string): Embed {
    const duration = GeneralUtilities.formatTimeDifference(this.startTime);

    return new Embed({
      title: "✅ Operation Complete",
      description: message || `Successfully processed all ${this.config.total} ${this.config.resource}.`,
      fields: [
        {
          name: "Total Processed",
          value: `\`${this.config.total}\` ${this.config.resource}`,
          inline: true
        },
        {
          name: "Duration",
          value: `\`${duration}\``,
          inline: true
        }
      ],
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Creates a visual progress bar using Unicode characters.
   */
  private createProgressBar(current: number, total: number, length: number = 20): string {
    if (total === 0) return "▱".repeat(length);

    const percentage = Math.min(current / total, 1);
    const filled = Math.floor(percentage * length);
    const empty = length - filled;

    const filledBar = "▰".repeat(filled);
    const emptyBar = "▱".repeat(empty);
    const percent = Math.round(percentage * 100);

    return `${filledBar}${emptyBar} ${percent}%`;
  }

  /**
   * Records progress for ETA calculation using linear regression.
   */
  private recordProgress(current: number): void {
    const now = Date.now();
    this.updateHistory.push({ time: now, current });

    // Keep only recent history for accurate ETA (last 10 data points)
    if (this.updateHistory.length > 10) {
      this.updateHistory.shift();
    }
  }

  /**
   * Calculates estimated time of arrival using linear regression on recent progress.
   */
  private calculateETA(current: number): string | null {
    if (this.updateHistory.length < 3 || current >= this.config.total) {
      return null;
    }

    // Calculate rate of progress (items per millisecond)
    const recentHistory = this.updateHistory.slice(-5); // Use last 5 data points
    const timeSpan = recentHistory[recentHistory.length - 1].time - recentHistory[0].time;
    const progressSpan = recentHistory[recentHistory.length - 1].current - recentHistory[0].current;

    if (timeSpan <= 0 || progressSpan <= 0) return null;

    const rate = progressSpan / timeSpan; // items per millisecond
    const remaining = this.config.total - current;
    const etaMs = remaining / rate;

    // Convert to human readable format
    const etaSeconds = Math.ceil(etaMs / 1000);

    if (etaSeconds < 60) {
      return `${etaSeconds}s`;
    } else if (etaSeconds < 3600) {
      const minutes = Math.ceil(etaSeconds / 60);
      return `${minutes}m`;
    } else {
      const hours = Math.ceil(etaSeconds / 3600);
      return `${hours}h`;
    }
  }

  /**
   * Utility method to get current progress percentage.
   */
  public getProgressPercentage(): number {
    if (this.updateHistory.length === 0) return 0;
    const current = this.updateHistory[this.updateHistory.length - 1].current;
    return Math.min((current / this.config.total) * 100, 100);
  }

  /**
   * Static factory method for easy creation.
   */
  public static async create(
    interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction,
    config: ProgressConfig,
    initialStatus?: string
  ): Promise<Progress> {
    const manager = new Progress(interaction, config);
    await manager.start(initialStatus);
    return manager;
  }
}
