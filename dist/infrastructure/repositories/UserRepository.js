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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const typedi_1 = require("typedi");
const IUserRepository_1 = require("../../application/repositories/IUserRepository");
const UserModel_1 = require("../models/UserModel");
let UserRepository = class UserRepository {
    createUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield UserModel_1.UserModel.create(user);
            return result;
        });
    }
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield UserModel_1.UserModel.findOne({ email });
            return result;
        });
    }
    updateUserStatus(email, isActive) {
        return __awaiter(this, void 0, void 0, function* () {
            yield UserModel_1.UserModel.updateOne({ email }, { isActive });
        });
    }
    updateUserById(id, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield UserModel_1.UserModel.findByIdAndUpdate(id, { $set: updates }, { new: true });
            return result;
        });
    }
    updateUserByEmail(email, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield UserModel_1.UserModel.findOneAndUpdate({ email }, { $set: updates }, { new: true });
            return result;
        });
    }
    findUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield UserModel_1.UserModel.findById(id)
                .select("-password -__v -createdAt -updatedAt");
            return user;
        });
    }
    updateProfile(userId, profilePic) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield UserModel_1.UserModel.findOneAndUpdate({ _id: userId }, { profilePicture: profilePic }, { new: true, fields: "_id name email profilePicture role" });
            return result;
        });
    }
    userDetails() {
        return __awaiter(this, void 0, void 0, function* () {
            const stats = yield UserModel_1.UserModel.aggregate([
                {
                    $group: {
                        _id: null,
                        totalUsers: { $sum: 1 },
                        blockedUsers: { $sum: { $cond: [{ $eq: ["$status", "blocked"] }, 1, 0] } },
                        activeUsers: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
                        verifiedUsers: { $sum: { $cond: [{ $eq: ["$isVerfied", true] }, 1, 0] } },
                        premiumUsers: { $sum: { $cond: [{ $eq: ["$isPremium", true] }, 1, 0] } },
                        normalUsers: { $sum: { $cond: [{ $eq: ["$role", "user"] }, 1, 0] } }
                    }
                }
            ]);
            return stats.length > 0 ? stats[0] : {
                totalUsers: 0,
                blockedUsers: 0,
                activeUsers: 0,
                verifiedUsers: 0,
                premiumUsers: 0,
                normalUsers: 0
            };
        });
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = __decorate([
    (0, typedi_1.Service)(IUserRepository_1.IUserRepositoryToken)
], UserRepository);
