"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
exports.OtpRepository = void 0;
const IOtpReposirtory_1 = require("../../application/repositories/IOtpReposirtory");
const otp_models_1 = __importDefault(require("../models/otp.models"));
const typedi_1 = require("typedi");
let OtpRepository = class OtpRepository {
    saveOtp(otp) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield otp_models_1.default.create(otp);
            return result;
        });
    }
    findOtpById(code, userId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const otpEntry = yield otp_models_1.default.findOne({
                code: code,
                userId: userId,
                type: type,
                expiresAt: { $gt: new Date() },
            });
            return otpEntry;
        });
    }
    // delete after verification
    deleteOtp(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield otp_models_1.default.deleteOne({ _id: id });
        });
    }
    deleteOtpByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield otp_models_1.default.deleteMany({ userId });
        });
    }
    // count documents in collection
    countVerificationCodes(id, type, time) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield otp_models_1.default.countDocuments({
                userId: id,
                type: type,
                createdAt: { $gt: time },
            });
            return result;
        });
    }
};
exports.OtpRepository = OtpRepository;
exports.OtpRepository = OtpRepository = __decorate([
    (0, typedi_1.Service)(IOtpReposirtory_1.IOtpReposirtoryCodeToken)
], OtpRepository);
