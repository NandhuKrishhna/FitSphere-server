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
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const MongoDBClient_1 = __importDefault(require("./infrastructure/database/MongoDBClient"));
const express_1 = __importDefault(require("express"));
const env_1 = require("./shared/constants/env");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_1 = require("./shared/constants/http");
const errorHandler_1 = __importDefault(require("./interface/middleware/auth/errorHandler"));
const authRotuer_1 = __importDefault(require("./interface/routes/auth/authRotuer"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: env_1.APP_ORIGIN,
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
app.get("/api/health", (req, res, next) => {
    return res.status(http_1.OK).json({
        status: 'healthy'
    });
});
app.use('/auth', authRotuer_1.default);
app.use(errorHandler_1.default);
app.listen(env_1.PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Server is running  port the on http://localhost:${env_1.PORT} in ${env_1.NODE_ENV} environment`);
    yield (0, MongoDBClient_1.default)();
}));
