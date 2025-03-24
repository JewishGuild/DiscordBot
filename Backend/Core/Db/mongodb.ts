import { MongoClient, Db } from "mongodb";
import { ConsoleUtilities } from "../../Utilities/console.utilities.js";
import { config } from "Config/root.config.js";

export class MongoDB {
  private static client: MongoClient;
  private static db: Db;
  private static host = config.mongodb.host;
  private static logger = new ConsoleUtilities("MongoDb");

  /** Connects to MongoDB */
  public static async connect(): Promise<void> {
    if (!this.client) {
      this.client = new MongoClient(this.host);

      this.client.on("error", (err) => MongoDB.logger.error(err.message));

      try {
        await this.client.connect();
        this.db = this.client.db(this.getDatabaseName());
        MongoDB.logger.log(`Connected to database: ${this.getDatabaseName()}`);
      } catch (error) {
        MongoDB.logger.error(`Failed to connect to MongoDB: ${error}`);
      }
    }
  }

  /** Returns the MongoDB database instance */
  public static getDatabase(): Db {
    if (!this.db) throw new Error("Database not initialized. Call `MongoDB.connect()` first.");
    return this.db;
  }

  /** Returns the database name based on NODE_ENV */
  private static getDatabaseName(): string {
    return config.appName + "-" + config.environment;
  }
}
