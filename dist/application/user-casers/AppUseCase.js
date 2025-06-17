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
exports.AppUseCase = void 0;
const cloudinary_1 = __importDefault(require("../../infrastructure/config/cloudinary"));
const typedi_1 = require("typedi");
const IUserRepository_1 = require("../repositories/IUserRepository");
const IDoctorReposirtory_1 = require("../repositories/IDoctorReposirtory");
const ISlotRepository_1 = require("../repositories/ISlotRepository");
const appAssert_1 = __importDefault(require("../../shared/utils/appAssert"));
const http_1 = require("../../shared/constants/http");
const IAppointmentRepository_1 = require("../repositories/IAppointmentRepository");
const IWalletRepository_1 = require("../repositories/IWalletRepository");
const INotificationRepository_1 = require("../repositories/INotificationRepository");
const IReviewsRepository_1 = require("../repositories/IReviewsRepository");
const IRatingsRepository_1 = require("../repositories/IRatingsRepository");
const ITransactionRepository_1 = require("../repositories/ITransactionRepository");
const socket_io_1 = require("../../infrastructure/config/socket.io");
const emitNotification_1 = require("../../shared/utils/emitNotification");
const IUserSubscriptionRepository_1 = require("../repositories/IUserSubscriptionRepository");
let AppUseCase = class AppUseCase {
    constructor(_userRepository, doctorRespository, __slotRespository, _appointmentRepository, __walletRepository, __notificationRepository, reviewsRepository, ratingRepository, __transactionRepository, userSubscriptionRepository) {
        this._userRepository = _userRepository;
        this.doctorRespository = doctorRespository;
        this.__slotRespository = __slotRespository;
        this._appointmentRepository = _appointmentRepository;
        this.__walletRepository = __walletRepository;
        this.__notificationRepository = __notificationRepository;
        this.reviewsRepository = reviewsRepository;
        this.ratingRepository = ratingRepository;
        this.__transactionRepository = __transactionRepository;
        this.userSubscriptionRepository = userSubscriptionRepository;
    }
    displayAllDoctors(_a) {
        return __awaiter(this, arguments, void 0, function* ({ page, limit, search, sort, gender, specialty, language, experience, }) {
            let sortBy = {};
            if (sort[1]) {
                sortBy[sort[0]] = sort[1];
            }
            else {
                sortBy[sort[0]] = "asc";
            }
            const doctors = yield this.doctorRespository.fetchAllDoctors({
                page,
                limit,
                search,
                sortBy,
                gender,
                specialty,
                language,
                experience,
            });
            return doctors;
        });
    }
    updateProfile(userId, profilePic) {
        return __awaiter(this, void 0, void 0, function* () {
            const uploadResponse = yield cloudinary_1.default.uploader.upload(profilePic);
            const updatedUser = yield this._userRepository.updateProfile(userId, uploadResponse.secure_url);
            (0, appAssert_1.default)(updatedUser, http_1.BAD_REQUEST, "Failed to update profile");
            return updatedUser;
        });
    }
    displayDoctorDetails(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const details = yield this.doctorRespository.fetchDoctorandDetailsById(doctorId);
            (0, appAssert_1.default)(details, http_1.BAD_REQUEST, "Doctor details not found");
            return details;
        });
    }
    getSlots(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const slots = yield this.__slotRespository.findAllActiveSlots(doctorId);
            (0, appAssert_1.default)(slots, http_1.NOT_FOUND, "No slots found. Please try another slot.");
            return slots;
        });
    }
    getWalletDetails(userId, role, queryParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const roleType = role === "user" ? "User" : "Doctor";
            const details = yield this.__walletRepository.getWalletDetailsById(userId, roleType, queryParams);
            return details;
        });
    }
    getNotifications(userId, role, queryParams) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, appAssert_1.default)(userId, http_1.BAD_REQUEST, "Invalid User. Please login again.");
            const details = yield this.__notificationRepository.getAllNotificationById(userId, role, queryParams);
            (0, appAssert_1.default)(details, http_1.BAD_REQUEST, "Unable to fetch notifications. Please try few minutes later.");
            return details;
        });
    }
    reviewAndRating(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, doctorId, rating, reviewText }) {
            const doctor = yield this.doctorRespository.findDoctorByID(doctorId);
            (0, appAssert_1.default)(doctor, http_1.BAD_REQUEST, "Doctor not found. Please try again later.");
            const user = yield this._userRepository.findUserById(userId);
            (0, appAssert_1.default)(user, http_1.BAD_REQUEST, "User not found. Please try again later.");
            (0, appAssert_1.default)(rating >= 1 && rating <= 5, http_1.BAD_REQUEST, "Rating should be between 1 and 5");
            (0, appAssert_1.default)(reviewText.length > 0, http_1.BAD_REQUEST, "Review is required");
            const doctorReviews = yield this.reviewsRepository.createReview({ userId, doctorId, rating, reviewText });
            const ratings = yield this.ratingRepository.findRatingByDoctorId(doctorId);
            let review;
            if (ratings) {
                const totalReviews = ratings.totalReviews + 1;
                const averageRating = (ratings.averageRating * ratings.totalReviews + rating) / totalReviews;
                review = yield this.ratingRepository.updateRating({ doctorId, totalReviews, averageRating });
            }
            else {
                review = yield this.ratingRepository.updateRating({ doctorId, totalReviews: 1, averageRating: rating });
            }
            const doctorSocketId = (0, socket_io_1.getReceiverSocketId)((doctor === null || doctor === void 0 ? void 0 : doctor._id).toString());
            const message = `You have a new review from ${user.name}`;
            (0, emitNotification_1.emitNotification)(doctorSocketId, message);
            return {
                review, doctorReviews
            };
        });
    }
    fetchReviewsAndRating(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const reviews = yield this.reviewsRepository.findAllReviewsByDoctorId(doctorId);
            const rating = yield this.ratingRepository.findRatingByDoctorId(doctorId);
            return { reviews, rating };
        });
    }
    getAllRatings() {
        return __awaiter(this, void 0, void 0, function* () {
            const ratings = yield this.ratingRepository.findAllRatings();
            return ratings;
        });
    }
    markAsReadNotification(notificationId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.__notificationRepository.markNotificationAsRead(notificationId);
        });
    }
    getTransactions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const transactions = yield this.__transactionRepository.getAllTransactions(userId);
            return transactions;
        });
    }
    editReview(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, doctorId, rating, reviewText, reviewId }) {
            (0, appAssert_1.default)(rating >= 1 && rating <= 5, http_1.BAD_REQUEST, "Rating should be between 1 and 5");
            (0, appAssert_1.default)(reviewText.length > 0, http_1.BAD_REQUEST, "Review is required");
            yield this.reviewsRepository.updateReview({ userId, doctorId, rating, reviewText, reviewId });
        });
    }
    deleteReview(doctorId, reviewId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const doctor = yield this.doctorRespository.findDoctorByID(doctorId);
            (0, appAssert_1.default)(doctor, http_1.BAD_REQUEST, "Doctor not found");
            (0, appAssert_1.default)(reviewId, http_1.BAD_REQUEST, "Review is required");
            (0, appAssert_1.default)(doctorId, http_1.BAD_REQUEST, "Doctor is required");
            yield this.reviewsRepository.deleteReview(doctorId, reviewId, userId);
        });
    }
    fetchTransactions(userId, queryParams, role) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, appAssert_1.default)(userId, http_1.BAD_REQUEST, "Invalid userId");
            return this.__transactionRepository.fetchAllTransactionById(userId, queryParams, role);
        });
    }
    getSubscriptionDetails(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const details = yield this.userSubscriptionRepository.getSubscriptionDetails(userId);
            return details;
        });
    }
};
exports.AppUseCase = AppUseCase;
exports.AppUseCase = AppUseCase = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)(IUserRepository_1.IUserRepositoryToken)),
    __param(1, (0, typedi_1.Inject)(IDoctorReposirtory_1.IDoctorRepositoryToken)),
    __param(2, (0, typedi_1.Inject)(ISlotRepository_1.ISlotRepositoryToken)),
    __param(3, (0, typedi_1.Inject)(IAppointmentRepository_1.IAppointmentRepositoryToken)),
    __param(4, (0, typedi_1.Inject)(IWalletRepository_1.IWalletRepositoryToken)),
    __param(5, (0, typedi_1.Inject)(INotificationRepository_1.INotificationRepositoryToken)),
    __param(6, (0, typedi_1.Inject)(IReviewsRepository_1.IReviewsRepositoryToken)),
    __param(7, (0, typedi_1.Inject)(IRatingsRepository_1.IRatingRepositoryToken)),
    __param(8, (0, typedi_1.Inject)(ITransactionRepository_1.ITransactionRepositoryToken)),
    __param(9, (0, typedi_1.Inject)(IUserSubscriptionRepository_1.IUserSubscriptionRepositoryToken)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], AppUseCase);
