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
exports.VerificationCodeRepository = void 0;
const typedi_1 = require("typedi");
const IVerificaitonCodeRepository_1 = require("../../application/repositories/IVerificaitonCodeRepository");
const verficationCode_model_1 = __importDefault(require("../models/verficationCode.model"));
let VerificationCodeRepository = class VerificationCodeRepository {
    createVerificationCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield verficationCode_model_1.default.create(code);
            return result;
        });
    }
    findVerificationCode(code, type) {
        return __awaiter(this, void 0, void 0, function* () {
            return verficationCode_model_1.default.findOne({
                _id: code,
                type: type,
                expiresAt: { $gt: new Date() },
            });
        });
    }
    deleteVerificationCode(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield verficationCode_model_1.default.deleteOne();
        });
    }
    countVerificationCodes(id, type, time) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield verficationCode_model_1.default.countDocuments({
                userId: id,
                type: type,
                createdAt: { $gt: time },
            });
            return result;
        });
    }
};
exports.VerificationCodeRepository = VerificationCodeRepository;
exports.VerificationCodeRepository = VerificationCodeRepository = __decorate([
    (0, typedi_1.Service)({ id: IVerificaitonCodeRepository_1.IVerficaitonCodeRepositoryToken })
], VerificationCodeRepository);
