
import { Router } from "express";

import { validateMiddleware } from "../../middleware/validate.middleware.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";


import { registerUserSchema } from "./user.validation.js";
import {
  registerUserController,
  getMeController,
} from "./user.controller.js";

const userRouter = Router();

// Public registration route
userRouter.post(
  "/register",
  validateMiddleware(registerUserSchema),
  registerUserController
);

// Protected current-user route
userRouter.get(
  "/me",
  authMiddleware,
  getMeController
);


export default userRouter;
