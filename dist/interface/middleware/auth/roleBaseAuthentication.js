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
const appAssert_1 = __importDefault(require("../../../shared/utils/appAssert"));
const http_1 = require("../../../shared/constants/http");
const authorizeRoles = (requiredRoles) => (0, catchErrors_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { role } = req;
    (0, appAssert_1.default)(role, http_1.UNAUTHORIZED, "User role not found", "MissingRole" /* AppErrorCode.MissingRole */);
    (0, appAssert_1.default)(requiredRoles.includes(role), http_1.FORBIDDEN, "You do not have permission to access this resource", "InsufficientPermission" /* AppErrorCode.InsufficientPermission */);
    next();
}));
exports.default = authorizeRoles;
