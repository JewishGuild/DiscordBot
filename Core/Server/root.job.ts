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

  /** Add a new job dynamically */
  public static addJob(job: BaseJob): void {
    const jobName = job["name"];

    // Check if job already exists
    const existingIndex = this.jobs.findIndex((j) => j["name"] === jobName);
    if (existingIndex !== -1) {
      this.logger.warn(`Job '${jobName}' already exists. Replacing existing job.`);
      this.jobs[existingIndex].stop();
      this.jobs[existingIndex] = job;
    } else {
      this.jobs.push(job);
    }

    job.start();
    this.logger.info(`Job '${jobName}' added and started. Total jobs: ${this.getJobCount()}`);
  }

  /** Remove a job by name */
  public static removeJob(jobName: string): boolean {
    const jobIndex = this.jobs.findIndex((job) => job["name"] === jobName);

    if (jobIndex === -1) {
      this.logger.warn(`Job '${jobName}' not found`);
      return false;
    }

    const job = this.jobs[jobIndex];
    job.stop();
    this.jobs.splice(jobIndex, 1);

    this.logger.info(`Job '${jobName}' removed and stopped. Total jobs: ${this.getJobCount()}`);
    return true;
  }

  /** Get all job names */
  public static getJobNames(): string[] {
    return this.jobs.map((job) => job["name"]);
  }

  /** Find a job by name */
  public static getJob(jobName: string): BaseJob | undefined {
    return this.jobs.find((job) => job["name"] === jobName);
  }

  /** Get the number of registered jobs */
  private static getJobCount(): number {
    return this.jobs.length;
  }
}
