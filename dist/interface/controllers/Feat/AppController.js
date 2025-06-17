"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
exports.AppController = void 0;
const catchErrors_1 = __importDefault(require("../../../shared/utils/catchErrors"));
const http_1 = require("../../../shared/constants/http");
const appAssert_1 = __importDefault(require("../../../shared/utils/appAssert"));
const typedi_1 = require("typedi");
const AppUseCase_1 = require("../../../application/user-casers/AppUseCase");
const bcrypt_1 = require("../../../shared/utils/bcrypt");
let AppController = class AppController {
    constructor(_appUseCase) {
        this._appUseCase = _appUseCase;
        this.displayAllDoctorsHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const page = req.query.page ? parseInt(req.query.page) - 1 : 0;
            const limit = req.query.limit ? parseInt(req.query.limit) : 8;
            const search = req.query.search ? req.query.search.trim() : "";
            let sort = req.query.sort ? req.query.sort.split(",") : ["_id"];
            // Extract filter parameters
            const gender = req.query.gender ? req.query.gender.split(",") : [];
            const specialty = req.query.specialty ? req.query.specialty.split(",") : [];
            const language = req.query.language ? req.query.language.split(",") : [];
            const experience = req.query.experience ? parseInt(req.query.experience) : 0;
            const { doctors, total } = yield this._appUseCase.displayAllDoctors({
                page,
                limit,
                search,
                sort,
                gender,
                specialty,
                language,
                experience,
            });
            return res.status(http_1.OK).json({
                success: true,
                message: "Doctors fetched successfully",
                doctors,
                pagination: {
                    total,
                    currentPage: page + 1,
                    totalPages: Math.ceil(total / limit),
                    limit,
                },
            });
        }));
        this.updateProfileHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { profilePic } = req.body;
            (0, appAssert_1.default)(profilePic, http_1.BAD_REQUEST, "Profile picture is required");
            const { userId } = req;
            const user = yield this._appUseCase.updateProfile(userId, profilePic);
            res.status(http_1.OK).json({
                message: "Profile picture updated successfully",
                profilePicture: user.profilePicture,
            });
        }));
        // display doctor details in the user side
        this.doctorDetailsHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const doctorId = (0, bcrypt_1.stringToObjectId)(req.body.doctorId);
            (0, appAssert_1.default)(doctorId, http_1.BAD_REQUEST, "Doctor Id is required");
            const doctorDetails = yield this._appUseCase.displayDoctorDetails(doctorId);
            res.status(http_1.OK).json({
                success: true,
                message: "Doctor details fetched successfully",
                doctorDetails,
            });
        }));
        this.getSlotsHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const doctorId = (0, bcrypt_1.stringToObjectId)(req.body.doctorId);
            (0, appAssert_1.default)(doctorId, http_1.BAD_REQUEST, "Doctor Id is required");
            const slots = yield this._appUseCase.getSlots(doctorId);
            res.status(http_1.OK).json({
                success: true,
                message: "Slots fetched successfully",
                slots,
            });
        }));
        this.getWalletHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const queryParams = req.query;
            const userId = (0, bcrypt_1.stringToObjectId)(req.params.userId);
            const { role } = req;
            const response = yield this._appUseCase.getWalletDetails(userId, role, queryParams);
            res.status(http_1.OK).json({
                success: true,
                message: "Wallet details fetched successfully",
                response,
            });
        }));
        this.getNotificationsHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId, role } = req;
            const queryParams = req.query;
            const allNotifications = yield this._appUseCase.getNotifications(userId, role, queryParams);
            res.status(http_1.OK).json({
                success: true,
                message: "Notifications fetched successfully",
                allNotifications,
            });
        }));
        // review and rating;
        this.reviewAndRatingHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { rating, reviewText } = req.body;
            const doctorId = (0, bcrypt_1.stringToObjectId)(req.body.doctorId);
            const { userId } = req;
            const { review, doctorReviews } = yield this._appUseCase.reviewAndRating({ userId, doctorId, rating, reviewText });
            res.status(http_1.OK).json({
                success: true,
                message: "Review and rating added successfully",
                reviewId: doctorReviews._id,
            });
        }));
        this.fetchReviewsAndRatingHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const doctorId = (0, bcrypt_1.stringToObjectId)(req.params.doctorId);
            (0, appAssert_1.default)(doctorId, http_1.BAD_REQUEST, "Doctor Id is required");
            const { reviews, rating } = yield this._appUseCase.fetchReviewsAndRating(doctorId);
            res.status(http_1.OK).json({
                success: true,
                message: "Reviews and rating fetched successfully",
                response: {
                    reviews,
                    averageRating: (rating === null || rating === void 0 ? void 0 : rating.averageRating) || 0,
                    totalReviews: (rating === null || rating === void 0 ? void 0 : rating.totalReviews) || 0,
                },
            });
        }));
        this.getAllRatingsHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this._appUseCase.getAllRatings();
            res.status(http_1.OK).json({
                success: true,
                message: "All reviews fetched successfully",
                response,
            });
        }));
        this.markAsReadNotificationHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req;
            const notificationId = (0, bcrypt_1.stringToObjectId)(req.body.notificationId);
            (0, appAssert_1.default)(notificationId, http_1.BAD_REQUEST, "No Notificaiton was found");
            yield this._appUseCase.markAsReadNotification(notificationId);
            res.status(http_1.OK).json({
                success: true,
                message: "Notification marked as read successfully",
            });
        }));
        this.getAllTransactionsHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req;
            const transactions = yield this._appUseCase.getTransactions(userId);
            res.status(http_1.OK).json({
                success: true,
                message: "Transactions fetched successfully",
                transactions
            });
        }));
        this.editReviewHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req;
            const { rating, reviewText } = req.body;
            const doctorId = (0, bcrypt_1.stringToObjectId)(req.body.doctorId);
            const reviewId = (0, bcrypt_1.stringToObjectId)(req.body.reviewId);
            yield this._appUseCase.editReview({ userId, doctorId, rating, reviewText, reviewId });
            res.status(http_1.OK).json({
                success: true,
                message: "Review and rating edited successfully",
            });
        }));
        this.deleteReviewHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req;
            const doctorId = (0, bcrypt_1.stringToObjectId)(req.body.doctorId);
            const reviewId = (0, bcrypt_1.stringToObjectId)(req.body.reviewId);
            yield this._appUseCase.deleteReview(doctorId, reviewId, userId);
            res.status(http_1.OK).json({
                success: true,
                message: "Review deleted successfully",
            });
        }));
        this.fetchTransactionHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId, role } = req;
            const queryParams = req.query;
            const response = yield this._appUseCase.fetchTransactions(userId, queryParams, role);
            res.status(http_1.OK).json(Object.assign({ success: true, message: "Transactions fetched successfully" }, response));
        }));
        this.getSubscriptionDetailsHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req;
            const response = yield this._appUseCase.getSubscriptionDetails(userId);
            res.status(http_1.OK).json({
                success: true,
                message: "Subscription details fetched successfully",
                response
            });
        }));
    }
};
exports.AppController = AppController;
exports.AppController = AppController = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)()),
    __metadata("design:paramtypes", [AppUseCase_1.AppUseCase])
], AppController);
