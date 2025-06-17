"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("./infrastructure/di/container");
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const MongoDBClient_1 = __importDefault(require("./infrastructure/database/MongoDBClient"));
const express_1 = __importDefault(require("express"));
const env_1 = require("./shared/constants/env");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const errorHandler_1 = __importDefault(require("./interface/middleware/auth/errorHandler"));
const authRotuer_1 = __importDefault(require("./interface/routes/auth/authRotuer"));
const doctorRouter_1 = __importDefault(require("./interface/routes/doctor/doctorRouter"));
const admin_route_1 = __importDefault(require("./interface/routes/Admin/admin.route"));
const app_router_1 = __importDefault(require("./interface/routes/Apps/app.router"));
const authMiddleware_1 = __importDefault(require("./interface/middleware/auth/authMiddleware"));
const socket_io_1 = require("./infrastructure/config/socket.io");
const roleBaseAuthentication_1 = __importDefault(require("./interface/middleware/auth/roleBaseAuthentication"));
const calories_router_1 = __importDefault(require("./interface/routes/Apps/calories.router"));
const doctorFeatRoutes_1 = __importDefault(require("./interface/routes/doctor/doctorFeatRoutes"));
const webrtcRouter_1 = __importDefault(require("./interface/routes/Apps/webrtcRouter"));
const cronJobs_1 = require("./application/services/cronJobs");
const common_routes_1 = __importDefault(require("./interface/routes/Apps/common.routes"));
const notification_routes_1 = __importDefault(require("./interface/routes/Apps/notification.routes"));
socket_io_1.app.use(express_1.default.json({ limit: '5mb' }));
socket_io_1.app.use((0, cookie_parser_1.default)());
socket_io_1.app.use((0, cors_1.default)({
    origin: env_1.APP_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
socket_io_1.app.options("*", (0, cors_1.default)());
socket_io_1.app.use("/api/auth", authRotuer_1.default);
socket_io_1.app.use("/api/doctor", doctorRouter_1.default);
socket_io_1.app.use("/api/admin", admin_route_1.default);
socket_io_1.app.use("/api/app", authMiddleware_1.default, (0, roleBaseAuthentication_1.default)(["user" /* Role.USER */]), app_router_1.default);
socket_io_1.app.use("/api/app", authMiddleware_1.default, (0, roleBaseAuthentication_1.default)(["user" /* Role.USER */]), calories_router_1.default);
socket_io_1.app.use("/api/doctor", authMiddleware_1.default, (0, roleBaseAuthentication_1.default)(["doctor" /* Role.DOCTOR */]), doctorFeatRoutes_1.default);
socket_io_1.app.use("/api", authMiddleware_1.default, (0, roleBaseAuthentication_1.default)(["user" /* Role.USER */, "doctor" /* Role.DOCTOR */]), webrtcRouter_1.default);
socket_io_1.app.use("/api/app-common", authMiddleware_1.default, (0, roleBaseAuthentication_1.default)(["user" /* Role.USER */, "doctor" /* Role.DOCTOR */]), common_routes_1.default);
socket_io_1.app.use("/api/notification", authMiddleware_1.default, (0, roleBaseAuthentication_1.default)(["user" /* Role.USER */, "doctor" /* Role.DOCTOR */, "admin" /* Role.ADMIN */]), notification_routes_1.default);
socket_io_1.app.use(errorHandler_1.default);
socket_io_1.server.listen(env_1.PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("MONGODB_URL:", process.env.MONGODB_URL);
    yield (0, MongoDBClient_1.default)();
    (0, cronJobs_1.setupCalorieIntakeCron)();
    console.log("Server is running on port", env_1.PORT);
}));
