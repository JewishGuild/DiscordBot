import { Request, Response } from "express";
import { ConsoleUtilities } from "../../../Utilities/console.utilities.js";
import { ControllerError } from "../Errors/controller.error.js";

/** Centralized error-handling middleware */
export const errorHandler = (err: ControllerError, req: Request, res: Response) => {
  const statusCode = err.statusCode || 500;
  const errorMessage = err.message || "Internal Server Error";

  const requestPath = req.originalUrl;
  const httpMethod = req.method;

  const logger = new ConsoleUtilities("Api");
  logger.error(`${errorMessage}`, `${httpMethod} ${requestPath}`); // check if i can check the request route in the api system to switch the controller string

  res.status(statusCode).json({ success: false, message: errorMessage });
};
