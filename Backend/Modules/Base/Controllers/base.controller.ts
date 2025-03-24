import { Request, Response, NextFunction } from "express";
import { ConsoleUtilities } from "../../../Utilities/console.utilities.js";

/** Abstract BaseController providing common response and error handling. */
export abstract class BaseController {
  protected logger: ConsoleUtilities;

  constructor() {
    this.logger = new ConsoleUtilities("Controller");
  }

  /** Sends a standardized JSON response or redirects if "redirect" is present. */
  protected handleResponse<T>(res: Response, data: T, message = "Success", statusCode = 200) {
    if (typeof data === "object" && data !== null && "redirect" in data) {
      const redirectUrl = (data as { redirect: string }).redirect;
      return res.redirect(redirectUrl);
    }

    return res.status(statusCode).json({ success: true, message, data });
  }

  /** Wrapper to auto-handle async errors. */
  protected wrapEndpoint<T>(fn: (req: Request, res: Response, next: NextFunction) => Promise<T>) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = await fn(req, res, next);
        this.handleResponse<T>(res, data);
      } catch (error) {
        next(error);
      }
    };
  }
}
