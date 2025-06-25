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
const catchErrors_1 = __importDefault(require("../../../shared/utils/catchErrors"));
const jwt_1 = require("../../../shared/utils/jwt");
const appAssert_1 = __importDefault(require("../../../shared/utils/appAssert"));
const http_1 = require("../../../shared/constants/http");
const UserModel_1 = require("../../../infrastructure/models/UserModel");
const DoctorModel_1 = require("../../../infrastructure/models/DoctorModel");
const adminModel_1 = require("../../../infrastructure/models/adminModel");
const authenticate = (0, catchErrors_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const accessToken = req.cookies.accessToken;
    (0, appAssert_1.default)(accessToken, http_1.UNAUTHORIZED, "Not authorized", "InvalidAccessToken" /* AppErrorCode.InvalidAccessToken */);
    const { error, payload } = (0, jwt_1.verifyToken)(accessToken);
    (0, appAssert_1.default)(payload, http_1.UNAUTHORIZED, error === "jwt expired" ? "Token expired" : "Invalid token", "InvalidAccessToken" /* AppErrorCode.InvalidAccessToken */);
    req.userId = payload.userId;
    req.sessionId = payload.sessionId;
    req.role = payload.role;
    let user;
    if (payload.role === "user" /* Role.USER */) {
        user = yield UserModel_1.UserModel.findById(payload.userId);
        (0, appAssert_1.default)((user === null || user === void 0 ? void 0 : user.status) !== "blocked", http_1.UNAUTHORIZED, "AccountSuspended" /* AppErrorCode.AccountSuspended */);
    }
    else if (payload.role === "doctor" /* Role.DOCTOR */) {
        user = yield DoctorModel_1.DoctorModel.findById(payload.userId);
        (0, appAssert_1.default)((user === null || user === void 0 ? void 0 : user.status) !== "blocked", http_1.UNAUTHORIZED, "AccountSuspended" /* AppErrorCode.AccountSuspended */);
        (0, appAssert_1.default)(user === null || user === void 0 ? void 0 : user.isApproved, http_1.UNAUTHORIZED, "AccountNotApproved" /* AppErrorCode.AccountNotApproved */);
    }
    else if (payload.role === "admin" /* Role.ADMIN */) {
        user = yield adminModel_1.AdminModel.findById(payload.userId);
    }
    (0, appAssert_1.default)(user, http_1.UNAUTHORIZED, "User not found", "UserNotFound" /* AppErrorCode.UserNotFound */);
    req.user = user;
    next();
}));
exports.default = authenticate;
