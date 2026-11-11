import cookieParser from "cookie-parser";
import express from "express"
import healthRouter from "./routes/health.routes.js"
import userRouter from "./modules/user/user.routes.js";

import { notFoundMiddleware } from "./middleware/not-found.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import authRouter from "./modules/auth/auth.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

/*
app.get("/health",(req,res)=>{
    res.status(200).json({
        success:true,
        message:"Backend is running"
    })
})
*/

app.use("/api",healthRouter);

app.use("/api/users", userRouter);

app.use("/api/auth", authRouter);

app.use(notFoundMiddleware);

app.use(errorMiddleware)

export default app