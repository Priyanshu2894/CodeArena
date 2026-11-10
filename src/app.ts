import express from "express"
import healthRouter from "./routes/health.routes.js"
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

app.use(express.json());

/*
app.get("/health",(req,res)=>{
    res.status(200).json({
        success:true,
        message:"Backend is running"
    })
})
*/

app.use("/api",healthRouter);

app.use(notFoundMiddleware);

app.use(errorMiddleware)

export default app