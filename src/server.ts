import "reflect-metadata";
import "dotenv/config";
import cors from "cors";
import connectToDatabase from "./infrastructure/database/MongoDBClient";
import express, { NextFunction, Request, Response } from "express";
import { APP_ORIGIN, NODE_ENV, PORT } from "./shared/constants/env";
import cookieParser from "cookie-parser";
import { OK } from "./shared/constants/http";
import errorHandler from "./interface/middleware/auth/errorHandler";
import authRouter from "./interface/routes/auth/authRotuer";

const app = express();

app.use(express.json());
app.use(cors({
  origin:APP_ORIGIN,
  credentials: true
}))
app.use(cookieParser())

app.get("/api/health", (req: Request, res: Response , next) => {
    return res.status(OK).json({
      status:'healthy'
    })
});
app.use('/auth', authRouter)
app.use(errorHandler)

app.listen(PORT, async() => {
  console.log(`Server is running  port the on http://localhost:${PORT} in ${NODE_ENV} environment`);
  await connectToDatabase();
});
