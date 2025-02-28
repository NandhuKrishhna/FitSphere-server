import "reflect-metadata";
import "./infrastructure/di/container";
import "dotenv/config";
import cors from "cors";
import connectToDatabase from "./infrastructure/database/MongoDBClient";
import express, { Request, Response } from "express";
import { NODE_ENV, PORT } from "./shared/constants/env";
import cookieParser from "cookie-parser";
import { OK } from "./shared/constants/http";
import errorHandler from "./interface/middleware/auth/errorHandler";
import authRouter from "./interface/routes/auth/authRotuer";
import doctorRoutes from "./interface/routes/doctor/doctorRouter";
import adminRouter from "./interface/routes/Admin/admin.route";
import appRouter from "./interface/routes/Apps/app.router";
import authenticate from "./interface/middleware/auth/authMiddleware";
import { app, server } from "./infrastructure/config/socket.io";
import authorizeRoles from "./interface/middleware/auth/roleBaseAuthentication";
import UserRoleTypes from "./shared/constants/UserRole";
import caloriesRouter from "./interface/routes/Apps/calories.router";
import doctorFeatRouter from "./interface/routes/doctor/doctorFeatRoutes";

app.use(express.json());
app.use(cookieParser());

// console.log("Allowed Origin:", APP_ORIGIN);
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());
app.get("/health", (req: Request, res: Response, next) => {
  return res.status(OK).json({
    status: "healthy",
  });
});
app.use("/api/auth", authRouter);
app.use("/api/doctor", doctorRoutes);
app.use("/api/admin", adminRouter);
app.use("/api/app", authenticate, authorizeRoles([UserRoleTypes.USER]), appRouter);
app.use("/api/app", authenticate, authorizeRoles([UserRoleTypes.USER]), caloriesRouter);
app.use("/api/doctor", authenticate, authorizeRoles([UserRoleTypes.DOCTOR]), doctorFeatRouter);
app.use(errorHandler);

server.listen(PORT, async () => {
  console.log(`Server is running  port the on http://localhost:${PORT} in ${NODE_ENV} environment`);
  await connectToDatabase();
});
