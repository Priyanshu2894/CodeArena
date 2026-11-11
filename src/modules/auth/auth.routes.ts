import { Router } from "express";
import { validateMiddleware } from "../../middleware/validate.middleware.js";
import { loginSchema } from "./auth.validation.js";
import {
  loginController,
  refreshTokenController,
  logoutController,
} from "./auth.controller.js";



const authRouter = Router();

authRouter.post(
  "/login",
  validateMiddleware(loginSchema),
  loginController
);
authRouter.post("/refresh", refreshTokenController);
authRouter.post("/logout", logoutController);

export default authRouter;