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
exports.DoctorRepository = void 0;
const IDoctorReposirtory_1 = require("../../application/repositories/IDoctorReposirtory");
const typedi_1 = require("typedi");
const doctor_details_model_1 = require("../models/doctor.details.model");
const DoctorModel_1 = require("../models/DoctorModel");
const bcrypt_1 = __importDefault(require("bcrypt"));
const UserModel_1 = require("../models/UserModel");
const RatingsModel_1 = __importDefault(require("../models/RatingsModel"));
let DoctorRepository = class DoctorRepository {
    findDoctorByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const doctor = yield DoctorModel_1.DoctorModel.findOne({ email });
            return doctor;
        });
    }
    createDoctor(doctor) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield DoctorModel_1.DoctorModel.create(doctor);
            return result;
        });
    }
    createDoctorDetails(details) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield doctor_details_model_1.DoctorDetailsModel.create(details);
            return result;
        });
    }
    findDoctorDetails(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield doctor_details_model_1.DoctorDetailsModel.findOne({ doctorId });
            return result;
        });
    }
    updateUserById(id, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield DoctorModel_1.DoctorModel.findByIdAndUpdate(id, { $set: updates }, { new: true });
            return result;
        });
    }
    decoration(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield DoctorModel_1.DoctorModel.deleteOne({ _id: id });
        });
    }
    findDoctorByID(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const doctor = yield DoctorModel_1.DoctorModel.findOne({ _id: id });
            return doctor;
        });
    }
    deleteDoctorById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield DoctorModel_1.DoctorModel.deleteOne({ _id: id });
        });
    }
    deleteDoctorDetails(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield doctor_details_model_1.DoctorDetailsModel.deleteOne({ doctorId: id });
        });
    }
    // fetching all doctors
    fetchAllDoctors(_a) {
        return __awaiter(this, arguments, void 0, function* ({ page, limit, search, sortBy, gender, specialty, language, experience, }) {
            var _b;
            try {
                const matchStage = {
                    $match: {
                        isApproved: true,
                        isVerified: true,
                        status: "active",
                    },
                };
                // Add search conditions
                if (search) {
                    matchStage.$match.$or = [
                        { name: { $regex: search, $options: "i" } },
                        { "doctorDetails.primarySpecialty": { $regex: search, $options: "i" } },
                        { "doctorDetails.consultationLanguages": { $regex: search, $options: "i" } },
                    ];
                }
                // Add filter conditions
                if (gender && gender.length > 0) {
                    matchStage.$match["doctorDetails.gender"] = { $in: gender };
                }
                if (specialty && specialty.length > 0) {
                    matchStage.$match["doctorDetails.primarySpecialty"] = { $in: specialty };
                }
                if (language && language.length > 0) {
                    matchStage.$match["doctorDetails.consultationLanguages"] = { $in: language };
                }
                if (experience && experience > 0) {
                    matchStage.$match["doctorDetails.experience"] = { $gte: experience };
                }
                const pipeline = [
                    {
                        $lookup: {
                            from: "doctordetails",
                            localField: "_id",
                            foreignField: "doctorId",
                            as: "doctorDetails",
                        },
                    },
                    { $unwind: { path: "$doctorDetails", preserveNullAndEmptyArrays: true } },
                    matchStage,
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            profilePicture: 1,
                            "doctorDetails.experience": 1,
                            "doctorDetails.consultationFees": 1,
                            "doctorDetails.primarySpecialty": 1,
                            "doctorDetails.gender": 1,
                            "doctorDetails.professionalTitle": 1,
                            "doctorDetails.consultationLanguages": 1,
                        },
                    },
                ];
                // Add sorting
                if (Object.keys(sortBy).length > 0) {
                    const sortStage = {
                        $sort: Object.entries(sortBy).reduce((acc, [key, value]) => {
                            acc[key] = value.toLowerCase() === "desc" ? -1 : 1;
                            return acc;
                        }, {}),
                    };
                    pipeline.push(sortStage);
                }
                // Calculate total
                const totalPipeline = [...pipeline];
                const countStage = { $count: "total" };
                const countResult = yield DoctorModel_1.DoctorModel.aggregate([...totalPipeline, countStage]);
                const total = ((_b = countResult[0]) === null || _b === void 0 ? void 0 : _b.total) || 0;
                // Add pagination
                const skipStage = { $skip: page * limit };
                const limitStage = { $limit: limit };
                pipeline.push(skipStage, limitStage);
                const doctors = yield DoctorModel_1.DoctorModel.aggregate(pipeline);
                return { doctors, total };
            }
            catch (error) {
                console.error("Error in fetchAllDoctors:", error);
                throw error;
            }
        });
    }
    fetchDoctorandDetailsById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield DoctorModel_1.DoctorModel.aggregate([
                    {
                        $match: {
                            _id: id,
                        },
                    },
                    {
                        $lookup: {
                            from: "doctordetails",
                            localField: "_id",
                            foreignField: "doctorId",
                            as: "details",
                        },
                    },
                    {
                        $unwind: "$details",
                    },
                    {
                        $project: {
                            password: 0,
                            isVerified: 0,
                            isApproved: 0,
                            createdAt: 0,
                            updatedAt: 0,
                            "details.createdAt": 0,
                            "details.updatedAt": 0,
                            __v: 0,
                        },
                    },
                ]);
                return result.length > 0 ? result[0] : null;
            }
            catch (error) {
                console.error("Error fetching doctor details::", error);
                throw new Error("Failed to fetch doctor details.");
            }
        });
    }
    updateDoctorDetailsByDocId(id, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield doctor_details_model_1.DoctorDetailsModel.findOneAndUpdate({ doctorId: id }, { $set: updates }, { new: true });
            return result;
        });
    }
    updatePassword(userId, newPassword, role) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const Model = role === "user" ? UserModel_1.UserModel : DoctorModel_1.DoctorModel;
                const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
                const result = yield Model.findByIdAndUpdate(userId, { $set: { password: hashedPassword } }, { new: true });
                if (!result) {
                    throw new Error("User not found or password update failed");
                }
            }
            catch (error) {
                console.error("Error updating password:", error);
                throw new Error("Failed to update password. Please try again.");
            }
        });
    }
    getDoctorStatistics() {
        return __awaiter(this, void 0, void 0, function* () {
            const stats = yield DoctorModel_1.DoctorModel.aggregate([
                {
                    $group: {
                        _id: null,
                        totalDoctors: { $sum: 1 },
                        approvedDoctors: { $sum: { $cond: [{ $eq: ["$isApproved", true] }, 1, 0] } },
                        verifiedDoctors: { $sum: { $cond: [{ $eq: ["$isVerified", true] }, 1, 0] } }
                    }
                }
            ]);
            const topDoctors = yield RatingsModel_1.default.aggregate([
                {
                    $sort: { averageRating: -1 }
                },
                {
                    $limit: 10
                },
                {
                    $lookup: {
                        from: "doctors",
                        localField: "doctorId",
                        foreignField: "_id",
                        as: "doctorDetails"
                    }
                },
                {
                    $unwind: "$doctorDetails"
                },
                {
                    $project: {
                        _id: "$doctorDetails._id",
                        name: "$doctorDetails.name",
                        email: "$doctorDetails.email",
                        profilePicture: "$doctorDetails.profilePicture",
                        averageRating: 1,
                        totalReviews: 1
                    }
                }
            ]);
            return {
                totalDoctors: stats.length > 0 ? stats[0].totalDoctors : 0,
                approvedDoctors: stats.length > 0 ? stats[0].approvedDoctors : 0,
                verifiedDoctors: stats.length > 0 ? stats[0].verifiedDoctors : 0,
                topDoctors
            };
        });
    }
};
exports.DoctorRepository = DoctorRepository;
exports.DoctorRepository = DoctorRepository = __decorate([
    (0, typedi_1.Service)(IDoctorReposirtory_1.IDoctorRepositoryToken)
], DoctorRepository);
