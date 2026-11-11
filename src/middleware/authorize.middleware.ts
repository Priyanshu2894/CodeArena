
import type { RequestHandler } from "express";

import { AppError } from "../errors/app-error.js";
import type { UserRole } from "../utils/jwt.js";

export const authorizeRoles = (
  ...allowedRoles: UserRole[]
): RequestHandler => {
  return (req, _res, next) => {
    // Check whether the user is authenticated.
    if (!req.user) {
      return next(
        new AppError("Authentication is required", 401)
      );
    }

    // Check whether the user's role is permitted.
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to access this resource", 403)
      );
    }

    // User is authenticated and has the required role.
    next();
  };
};
