import { App } from "./app.js";
import { ConsoleUtilities } from "../../Utilities/console.utilities.js";
import { Server as HttpServer } from "http";
import { config } from "../../Config/root.config.js";

/**
 * Singleton class for managing the Express server.
 */
export class Server {
  private static instance: Server;
  private readonly port: number;
  private readonly host: string;
  private readonly appInstance: App;
  private readonly logger: ConsoleUtilities;
  private httpServer?: HttpServer;

  private constructor() {
    this.port = config.server.port;
    this.host = config.server.host;
    this.appInstance = App.getInstance();
    this.logger = new ConsoleUtilities("Server");
  }

  /**
   * Retrieves the singleton instance of the server.
   *
   * @returns The server instance.
   */
  public static getInstance(): Server {
    if (!this.instance) {
      this.instance = new Server();
    }
    return this.instance;
  }

  /**
   * Starts the HTTP server and initializes services.
   */
  public async start(): Promise<void> {
    try {
      this.logger.log("Initializing services...");

      // Ensure the app is ready before starting the server
      const app = this.appInstance.getApp();
      this.httpServer = app.listen(this.port, () => {
        this.logger.success(`Running on ${this.host}:${this.port}`);
      });
    } catch (error) {
      this.logger.error("Failed to start server: " + (error as Error).message);
      process.exit(1);
    }
  }
}
