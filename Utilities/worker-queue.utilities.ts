/** Worker queue that processes items with controlled concurrency. */
export class WorkerQueue<T> {
  private readonly items: T[];
  private readonly processor: (item: T) => Promise<void>;
  private readonly concurrency: number;
  private currentIndex = 0;
  private activeWorkers = 0;
  private resolve?: () => void;

  constructor(items: T[], processor: (item: T) => Promise<void>, concurrency: number = 5) {
    this.items = items;
    this.processor = processor;
    this.concurrency = concurrency;
  }

  /** Processes all items using worker queue pattern. */
  public async run(): Promise<void> {
    if (this.items.length === 0) return;

    return new Promise((resolve) => {
      this.resolve = resolve;

      // Start initial workers
      const workerCount = Math.min(this.concurrency, this.items.length);
      for (let i = 0; i < workerCount; i++) {
        this.startWorker();
      }
    });
  }

  /** Starts a worker that continuously processes items until queue is empty. */
  private async startWorker(): Promise<void> {
    this.activeWorkers++;

    while (this.currentIndex < this.items.length) {
      // Get next item atomically
      const itemIndex = this.currentIndex++;
      if (itemIndex >= this.items.length) break;

      const item = this.items[itemIndex];

      try {
        await this.processor(item);
      } catch (error) {
        console.error(`Worker error processing item at index ${itemIndex}:`, error);
      }
    }

    // Worker finished
    this.activeWorkers--;

    // If this is the last worker, signal completion
    if (this.activeWorkers === 0 && this.resolve) {
      this.resolve();
    }
  }
}
