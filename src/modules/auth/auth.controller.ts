import type { Request, Response } from "express";
import { loginUser , refreshUser , logoutUser } from "./auth.service.js";
import { env } from "../../config/env.js";
import { AppError } from "../../errors/app-error.js";

export const loginController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await loginUser({
    email,
    password,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user,
      accessToken,
    },
  });
};


export const refreshTokenController = async (
  req: Request,
  res: Response
): Promise<void> => {
  // 1. Read refresh token from HTTP-only cookie
  const refreshToken = req.cookies?.refreshToken;

  // 2. Check whether refresh token exists
  if (!refreshToken || typeof refreshToken !== "string") {
    throw new AppError("Refresh token is required", 401);
  }

  // 3. Generate new access and refresh tokens
  const tokens = await refreshUser(refreshToken);

  // 4. Set replacement refresh token in HTTP-only cookie
  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });

  // 5. Return new access token
  res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
    data: {
      accessToken: tokens.accessToken,
    },
  });
};


export const logoutController = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Read the refresh token from the HTTP-only cookie.
  const refreshToken = req.cookies?.refreshToken;

  // Revoke all active refresh tokens belonging to this session.
  await logoutUser(refreshToken);

  // Clear the refresh-token cookie.
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
