import type { RequestHandler } from "express";
import { z } from "zod";
import { AppError } from "../errors/app-error.js";

export const validateMiddleware = (schema: z.ZodType): RequestHandler => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errorMessage = result.error.issues
        .map((issue) => issue.message)
        .join(", ");

      return next(
        new AppError(`Validation failed: ${errorMessage}`, 400)
      );
    }

    // Replace request body with validated and transformed data
    req.body = result.data;

    next();
  };
};