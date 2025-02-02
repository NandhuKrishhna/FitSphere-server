import "reflect-metadata";
import './infrastructure/di/container'
import "dotenv/config";
import cors from "cors";
import session from 'express-session'
import connectToDatabase from "./infrastructure/database/MongoDBClient";
import express, { NextFunction, Request, Response } from "express";
import { APP_ORIGIN, NODE_ENV, PORT, SESSION_SECRET } from "./shared/constants/env";
import cookieParser from "cookie-parser";
import { OK } from "./shared/constants/http";
import errorHandler from "./interface/middleware/auth/errorHandler";
import authRouter from "./interface/routes/auth/authRotuer";
<<<<<<< HEAD
import doctorRoutes from "./interface/routes/doctor/doctorRoutes";
=======
import doctorRoutes from "./interface/routes/doctor/doctorRouter";
>>>>>>> authentication-feat

const app = express();

app.use(express.json());
app.use(
  session({
    secret: 'yourSecretKey', 
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: NODE_ENV === 'production',  
      sameSite: 'lax', 
      maxAge: 1000 * 60 * 15, 
    }
  })
);

app.use(cors({
  origin:APP_ORIGIN,
  credentials: true
}))
app.use(cookieParser())

app.get("/health", (req: Request, res: Response , next) => {
    return res.status(OK).json({
      status:'healthy'
    })
});
app.use('/api/auth', authRouter)
app.use('/api/doctor', doctorRoutes)
<<<<<<< HEAD

=======
>>>>>>> authentication-feat
app.use(errorHandler)

app.listen(PORT, async() => {
  console.log(`Server is running  port the on http://localhost:${PORT} in ${NODE_ENV} environment`);
  await connectToDatabase();
});
