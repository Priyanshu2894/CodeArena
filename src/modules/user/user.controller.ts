
import type { Request, Response } from "express";
import { createUser, getUserById } from "./user.service.js";
import { AppError } from "../../errors/app-error.js";

export const registerUserController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, email, password } = req.body;

  const user = await createUser({ name, email, password });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: user,
  });
};

export const getMeController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError("Authentication is required", 401);
  }

  const user = await getUserById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "User profile fetched successfully",
    data: user,
  });
};
