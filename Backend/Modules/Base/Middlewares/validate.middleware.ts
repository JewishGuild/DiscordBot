import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";
import { ControllerError } from "../Errors/controller.error.js";

/**
 * Middleware to validate request bodies using Joi schemas
 * @param schema Joi schema to validate against
 */
export const validateRequest = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const messages = error.details.map((detail) => detail.message.replace(/['"]+/g, "'"));
      return next(new ControllerError(messages.join(", "), 400));
    }

    next();
  };
};
