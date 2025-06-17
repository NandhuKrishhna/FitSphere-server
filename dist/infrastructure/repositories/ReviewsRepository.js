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
exports.ReviewsRepository = void 0;
const typedi_1 = require("typedi");
const IReviewsRepository_1 = require("../../application/repositories/IReviewsRepository");
const ReviewModel_1 = __importDefault(require("../models/ReviewModel"));
let ReviewsRepository = class ReviewsRepository {
    createReview(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, doctorId, rating, reviewText }) {
            return yield ReviewModel_1.default.create({ userId, doctorId, rating, reviewText });
        });
    }
    findAllReviewsByDoctorId(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ReviewModel_1.default.aggregate([
                {
                    $match: { doctorId },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "userDetails",
                    },
                },
                {
                    $unwind: "$userDetails",
                },
                {
                    $sort: { createdAt: -1 },
                },
                {
                    $project: {
                        _id: 1,
                        doctorId: 1,
                        userId: 1,
                        rating: 1,
                        reviewText: 1,
                        createdAt: 1,
                        "userDetails._id": 1,
                        "userDetails.name": 1,
                        "userDetails.profilePicture": 1,
                    },
                },
            ]);
        });
    }
    updateReview(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, doctorId, rating, reviewText, reviewId }) {
            yield ReviewModel_1.default.updateOne({ userId, doctorId, _id: reviewId }, { rating, reviewText });
        });
    }
    deleteReview(doctorId, reviewId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield ReviewModel_1.default.deleteOne({ userId, doctorId, _id: reviewId });
        });
    }
};
exports.ReviewsRepository = ReviewsRepository;
exports.ReviewsRepository = ReviewsRepository = __decorate([
    (0, typedi_1.Service)(IReviewsRepository_1.IReviewsRepositoryToken)
], ReviewsRepository);
