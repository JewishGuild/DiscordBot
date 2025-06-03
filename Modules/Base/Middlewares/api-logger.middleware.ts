import { NextFunction, Request, Response } from "express";
import { ConsoleUtilities } from "../../../Utilities/console.utilities.js";

class ApiLogger {
  private logger: ConsoleUtilities;

  constructor() {
    this.logger = new ConsoleUtilities("Api");
  }

  public logApiRequests(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    res.on("finish", () => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      const log = `${req.method} ${req.originalUrl} ${res.statusCode} ${responseTime.toFixed(2)} ms`;

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      res.statusCode < 400 ? this.apiLog(log) : this.apiError(log);
    });
    next();
  }

  private apiLog(msg: string) {
    this.logger.success(msg);
  }

  private apiError(msg: string) {
    this.logger.error(msg);
  }
}

export const apiLogger = new ApiLogger();
