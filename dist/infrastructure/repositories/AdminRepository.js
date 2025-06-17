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
exports.AdminRepository = void 0;
const typedi_1 = require("typedi");
const IAdminRepository_1 = require("../../application/repositories/IAdminRepository");
const adminModel_1 = require("../models/adminModel");
const UserModel_1 = require("../models/UserModel");
const DoctorModel_1 = require("../models/DoctorModel");
let AdminRepository = class AdminRepository {
    findAdminByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const admin = yield adminModel_1.AdminModel.findOne({ email });
            return admin;
        });
    }
    getAllUsers(queryParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page = "1", limit = "5", sortBy = "createdAt", sortOrder = "desc", search, email, name, isVerfied, isActive, status } = queryParams;
            const pageNumber = parseInt(page, 10);
            const pageSize = parseInt(limit, 10);
            const sortDirection = sortOrder === "asc" ? 1 : -1;
            const filter = {};
            if (email) {
                filter.email = email;
            }
            if (name) {
                filter.name = { $regex: name, $options: "i" };
            }
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } }
                ];
            }
            if (isVerfied !== undefined) {
                filter.isVerfied = isVerfied === "true";
            }
            if (isActive !== undefined) {
                filter.isActive = isActive === "true";
            }
            if (status) {
                filter.status = status;
            }
            const users = yield UserModel_1.UserModel.find(filter)
                .select("-password -__v -createdAt -updatedAt")
                .sort({ [sortBy]: sortDirection })
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize);
            const totalUsers = yield UserModel_1.UserModel.countDocuments();
            const verifiedUsers = yield UserModel_1.UserModel.countDocuments({ isVerfied: true });
            const activeUsers = yield UserModel_1.UserModel.countDocuments({ isActive: true });
            const blockedUsers = yield UserModel_1.UserModel.countDocuments({ status: "blocked" });
            return {
                users,
                totalUsers,
                verifiedUsers,
                activeUsers,
                blockedUsers,
                currentPage: pageNumber,
                totalPages: Math.ceil(totalUsers / pageSize),
            };
        });
    }
    getAllDoctors(queryParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page = "1", limit = "10", sortBy = "createdAt", sortOrder = "desc", search, email, name, status, isApproved, isVerified, isActive } = queryParams;
            const pageNumber = parseInt(page, 10);
            const pageSize = parseInt(limit, 10);
            const sortDirection = sortOrder === "asc" ? 1 : -1;
            const filter = {};
            if (email) {
                filter.email = email;
            }
            if (name) {
                filter.name = name;
            }
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } }
                ];
            }
            if (isVerified !== undefined) {
                filter.isVerfied = isVerified === "true";
            }
            if (isActive !== undefined) {
                filter.isActive = isActive === "true";
            }
            if (isApproved !== undefined) {
                filter.isApproved = isApproved === "true";
            }
            if (status) {
                filter.status = status;
            }
            const doctors = yield DoctorModel_1.DoctorModel.find(filter)
                .select("-password -__v -createdAt -updatedAt")
                .sort({ [sortBy]: sortDirection })
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize);
            const totalDoctors = yield DoctorModel_1.DoctorModel.countDocuments(filter);
            const verifiedDoctors = yield DoctorModel_1.DoctorModel.countDocuments({ isVerfied: true });
            const activeDoctors = yield DoctorModel_1.DoctorModel.countDocuments({ isActive: true });
            const blockedDoctors = yield DoctorModel_1.DoctorModel.countDocuments({ status: "blocked" });
            const pendingDoctors = yield DoctorModel_1.DoctorModel.countDocuments({ isApproved: false });
            const approvedDoctors = yield DoctorModel_1.DoctorModel.countDocuments({ isApproved: true });
            return {
                doctors,
                totalDoctors,
                verifiedDoctors,
                activeDoctors,
                blockedDoctors,
                pendingDoctors,
                approvedDoctors,
                currentPage: pageNumber,
                totalPages: Math.ceil(totalDoctors / pageSize),
            };
        });
    }
    approveRequest(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield DoctorModel_1.DoctorModel.findByIdAndUpdate(id, { $set: { isApproved: true } }, { new: true });
        });
    }
    rejectRequest(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield DoctorModel_1.DoctorModel.findByIdAndUpdate(id, { $set: { isApproved: false } }, { new: true });
            return response;
        });
    }
    doctorDetails() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield DoctorModel_1.DoctorModel.aggregate([
                {
                    $lookup: {
                        from: "doctordetails",
                        localField: "_id",
                        foreignField: "doctorId",
                        as: "doctorDetails",
                    },
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        email: 1,
                        role: 1,
                        isActive: 1,
                        status: 1,
                        isApproved: 1,
                        doctorDetails: 1,
                    },
                },
            ]);
            if (response && response.length > 0) {
                return response[0];
            }
            else {
                return null;
            }
        });
    }
    unblockById(id, role) {
        return __awaiter(this, void 0, void 0, function* () {
            if (role === "user") {
                return yield UserModel_1.UserModel.findOneAndUpdate({ _id: id }, { $set: { status: "active" } }, { new: true });
            }
            else {
                return yield DoctorModel_1.DoctorModel.findOneAndUpdate({ _id: id }, { $set: { status: "active" } }, { new: true });
            }
        });
    }
    blockById(id, role) {
        return __awaiter(this, void 0, void 0, function* () {
            if (role === "user") {
                return yield UserModel_1.UserModel.findOneAndUpdate({ _id: id }, { $set: { status: "blocked" } }, { new: true });
            }
            else {
                return yield DoctorModel_1.DoctorModel.findOneAndUpdate({ _id: id }, { $set: { status: "blocked" } }, { new: true });
            }
        });
    }
};
exports.AdminRepository = AdminRepository;
exports.AdminRepository = AdminRepository = __decorate([
    (0, typedi_1.Service)(IAdminRepository_1.IAdminRepositoryToken)
], AdminRepository);
