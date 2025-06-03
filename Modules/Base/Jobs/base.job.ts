import moment from "moment";
import { CronJob } from "cron";
import { ConsoleUtilities } from "../../../Utilities/console.utilities.js";

/**
 * Abstract base class for all scheduled cron jobs.
 */
export abstract class BaseJob {
  protected name: string;
  protected timeExpression: string;
  protected isRunning: boolean = false;
  protected logger: ConsoleUtilities;
  private cronJob: CronJob | null = null;

  /** Creates a new job instance. */
  constructor(name: string, timeExpression: string) {
    this.name = name;
    this.timeExpression = timeExpression;
    this.logger = new ConsoleUtilities("Job", this.name);
  }

  /** Abstract method that must be implemented by concrete job classes. */
  protected abstract execute(): Promise<void> | void;

  /** Starts the cron job. This method is final to ensure consistent behavior. */
  public start(): void {
    if (this.cronJob) return;
    this.cronJob = new CronJob(this.timeExpression, async () => await this.run(), null, true);
    this.logger.log(`Started with schedule: ${this.timeExpression}`);
  }

  /** Stops the cron job. */
  public stop(): void {
    if (!this.cronJob) return;
    this.cronJob.stop();
    this.cronJob = null;
    this.logger.log("Stopped");
  }

  /**
   * Internal method that handles execution, logging, and error catching.
   * Prevents overlapping executions.
   */
  private async run(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn("Skipping execution - job is still running from previous trigger");
      return;
    }
    const startTime = moment();
    this.isRunning = true;

    try {
      await this.execute();

      const duration = moment.duration(moment().diff(startTime)).asSeconds();
      this.logger.info(`Completed in ${duration}s`);
    } catch (error) {
      this.logger.error(`Failed: ${error}`);
    } finally {
      this.isRunning = false;
    }
  }
}
