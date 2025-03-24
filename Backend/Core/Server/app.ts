import express, { Application, Request, Response } from "express";
import cors from "cors";
import { apiLogger } from "../../Modules/Base/Middlewares/api-logger.middleware.js";
import { errorHandler } from "../../Modules/Base/Middlewares/error-handler.middleware.js";
import { RootRouter } from "./root.router.js";

/**
 * Singleton class for setting up and managing the Express application.
 */
export class App {
  private static instance: App;
  private readonly app: Application;

  private constructor() {
    this.app = express();
    this.setupGlobalMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Retrieves the singleton instance of the application.
   *
   * @returns The application instance.
   */
  public static getInstance(): App {
    if (!this.instance) {
      this.instance = new App();
    }
    return this.instance;
  }

  /**
   * Retrieves the Express application instance.
   *
   * @returns The Express app.
   */
  public getApp(): Application {
    return this.app;
  }

  /**
   * Sets up global middleware.
   */
  private setupGlobalMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Logging API requests for all routes under /api/*
    this.app.all("/api/*", express.json(), apiLogger.logApiRequests.bind(apiLogger));
    this.app.use(cors({ origin: ["http://localhost:3001"], credentials: true }));
  }

  /**
   * Sets up application routes.
   */
  private setupRoutes(): void {
    this.app.get("/", (req: Request, res: Response) => {
      res.send("Alive!");
    });

    // API routes
    this.app.use("/api", RootRouter.init());

    // Catch-all route for 404 errors
    this.app.all("*", (req: Request, res: Response) => {
      res.status(404).json({ error: "Not Found" });
    });
  }

  /**
   * Sets up global error handling middleware.
   */
  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }
}
