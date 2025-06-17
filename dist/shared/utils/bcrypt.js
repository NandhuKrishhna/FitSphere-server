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
exports.stringToObjectId = exports.comparePassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = __importDefault(require("mongoose"));
const hashPassword = (value, saltRounds) => __awaiter(void 0, void 0, void 0, function* () { return bcrypt_1.default.hash(value, saltRounds || 10); });
exports.hashPassword = hashPassword;
const comparePassword = (value, hashedValue) => __awaiter(void 0, void 0, void 0, function* () { return bcrypt_1.default.compare(value, hashedValue).catch(() => false); });
exports.comparePassword = comparePassword;
const stringToObjectId = (id) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid ObjectId format");
    }
    return new mongoose_1.default.Types.ObjectId(id);
};
exports.stringToObjectId = stringToObjectId;
