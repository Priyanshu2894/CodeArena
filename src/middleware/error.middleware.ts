
import type { ErrorRequestHandler } from "express";
import { AppError } from "../errors/app-error.js";

export const errorMiddleware: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;

  const message =
    err instanceof AppError
      ? err.message
      : "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
  });
};
