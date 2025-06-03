import { BaseJob } from "../../Modules/Base/Jobs/base.job.js";
import { ConsoleUtilities } from "../../Utilities/console.utilities.js";
import { mutedJob } from "../../Modules/Moderation/Jobs/muted.job.js";

/**
 * RootJob handles the lifecycle of multiple jobs.
 * Implements the Registry pattern for job management.
 */
export class RootJob {
  private static jobs: BaseJob[] = [mutedJob];
  private static readonly logger = new ConsoleUtilities("Job", "Root");

  /** Start all registered jobs */
  public static startAll(): void {
    this.logger.info(`Starting ${this.getJobCount()} jobs`);
    this.jobs.forEach((job) => job.start());
  }

  /** Stop all jobs */
  public static stopAll(): void {
    this.logger.info(`Stopping ${this.getJobCount()} jobs`);
    this.jobs.forEach((job) => job.start());
  }

  /** Get the number of registered jobs */
  private static getJobCount(): number {
    return this.jobs.length;
  }
}
