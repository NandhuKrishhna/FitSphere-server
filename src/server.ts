import "reflect-metadata";
import "./infrastructure/di/container";
import "dotenv/config";
import cors from "cors";
import connectToDatabase from "./infrastructure/database/MongoDBClient";
import express, { Request, Response } from "express";
import { APP_ORIGIN, NODE_ENV, PORT } from "./shared/constants/env";
import cookieParser from "cookie-parser";
import errorHandler from "./interface/middleware/auth/errorHandler";
import authRouter from "./interface/routes/auth/authRotuer";
import doctorRoutes from "./interface/routes/doctor/doctorRouter";
import adminRouter from "./interface/routes/Admin/admin.route";
import appRouter from "./interface/routes/Apps/app.router";
import authenticate from "./interface/middleware/auth/authMiddleware";
import { app, server } from "./infrastructure/config/socket.io";
import authorizeRoles from "./interface/middleware/auth/roleBaseAuthentication";
import Role from "./shared/constants/UserRole";
import caloriesRouter from "./interface/routes/Apps/calories.router";
import doctorFeatRouter from "./interface/routes/doctor/doctorFeatRoutes";
import webrtcRouter from "./interface/routes/Apps/webrtcRouter";
import { setupCalorieIntakeCron } from "./application/services/cronJobs";
import commonRouter from "./interface/routes/Apps/common.routes";
import notificationRouter from "./interface/routes/Apps/notification.routes";


app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

app.use(
  cors({
    origin: APP_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

app.use("/api/auth", authRouter);
app.use("/api/doctor", doctorRoutes);
app.use("/api/admin", adminRouter);
app.use("/api/app", authenticate, authorizeRoles([Role.USER]), appRouter);
app.use("/api/app", authenticate, authorizeRoles([Role.USER]), caloriesRouter);
app.use("/api/doctor", authenticate, authorizeRoles([Role.DOCTOR]), doctorFeatRouter);
app.use("/api", authenticate, authorizeRoles([Role.USER, Role.DOCTOR]), webrtcRouter);
app.use("/api/app-common", authenticate, authorizeRoles([Role.USER, Role.DOCTOR]), commonRouter);
app.use("/api/notification", authenticate, authorizeRoles([Role.USER, Role.DOCTOR, Role.ADMIN]), notificationRouter);
app.use(errorHandler);

server.listen(PORT, async () => {
  console.log("MONGODB_URL:", process.env.MONGODB_URL);
  await connectToDatabase();
  setupCalorieIntakeCron();
  console.log("Server is running on port", PORT);

});
