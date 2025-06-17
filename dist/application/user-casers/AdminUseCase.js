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
exports.AdminUseCase = void 0;
const typedi_1 = require("typedi");
const IAdminRepository_1 = require("../repositories/IAdminRepository");
const appAssert_1 = __importDefault(require("../../shared/utils/appAssert"));
const http_1 = require("../../shared/constants/http");
const mongoose_1 = __importDefault(require("mongoose"));
const date_1 = require("../../shared/utils/date");
const ISessionRepository_1 = require("../repositories/ISessionRepository");
const jwt_1 = require("../../shared/utils/jwt");
const INotificationRepository_1 = require("../repositories/INotificationRepository");
const IDoctorReposirtory_1 = require("../repositories/IDoctorReposirtory");
const sendMail_1 = require("../../shared/constants/sendMail");
const IUserRepository_1 = require("../repositories/IUserRepository");
const RequestRejectEmailTemplate_1 = require("../../shared/utils/EmailTemplates/RequestRejectEmailTemplate");
const DoctorApprovalTemplate_1 = require("../../shared/utils/EmailTemplates/DoctorApprovalTemplate");
const builder_1 = require("../../shared/utils/builder");
const IWalletRepository_1 = require("../repositories/IWalletRepository");
const socket_io_1 = require("../../infrastructure/config/socket.io");
const emitNotification_1 = require("../../shared/utils/emitNotification");
const IPremiumSubscription_1 = require("../repositories/IPremiumSubscription");
let AdminUseCase = class AdminUseCase {
    constructor(_adminRepository, _sessionRepository, __notificationRepository, _doctorRepository, _userRepository, _walletRespository, _premiumSubscriptionRepository) {
        this._adminRepository = _adminRepository;
        this._sessionRepository = _sessionRepository;
        this.__notificationRepository = __notificationRepository;
        this._doctorRepository = _doctorRepository;
        this._userRepository = _userRepository;
        this._walletRespository = _walletRespository;
        this._premiumSubscriptionRepository = _premiumSubscriptionRepository;
    }
    // method for admin login
    adminLogin(adminData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const existingUser = yield this._adminRepository.findAdminByEmail(adminData.email);
            (0, appAssert_1.default)(existingUser, http_1.UNAUTHORIZED, "Invalid email or user does not exist");
            const isValid = yield existingUser.comparePassword(adminData.password);
            (0, appAssert_1.default)(isValid, http_1.UNAUTHORIZED, "Invalid email or password!");
            const newSession = (0, builder_1.IcreateSession)(existingUser._id, "admin" /* Role.ADMIN */, adminData.userAgent, (0, date_1.oneYearFromNow)());
            const session = yield this._sessionRepository.createSession(newSession);
            const sessionInfo = {
                sessionId: (_a = session._id) !== null && _a !== void 0 ? _a : new mongoose_1.default.Types.ObjectId(),
                role: session.role,
            };
            const adminID = existingUser._id;
            const accessToken = (0, jwt_1.signToken)(Object.assign(Object.assign({}, sessionInfo), { userId: adminID, role: session.role }));
            const refreshToken = (0, jwt_1.signToken)(sessionInfo, jwt_1.refreshTokenSignOptions);
            return {
                user: {
                    _id: existingUser._id,
                    name: existingUser.name,
                    email: existingUser.email,
                    profilePicture: existingUser.profilePicture,
                    role: existingUser.role,
                },
                accessToken,
                refreshToken,
            };
        });
    }
    getAllUsers(queryParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this._adminRepository.getAllUsers(queryParams);
            return users;
        });
    }
    getAllDoctors(queryParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const doctors = yield this._adminRepository.getAllDoctors(queryParams);
            return doctors;
        });
    }
    logoutAdmin(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._sessionRepository.findByIdAndDelete(payload.sessionId);
        });
    }
    getNotification() {
        return __awaiter(this, void 0, void 0, function* () {
            const type = ["doctor_registration" /* NotificationType.DoctorRegistration */];
            const notification = yield this.__notificationRepository.getAllNotifications(type);
            return notification;
        });
    }
    approveRequest(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this._doctorRepository.findDoctorByID(id);
            (0, appAssert_1.default)(user, http_1.BAD_REQUEST, "User not found . Please try again");
            (0, appAssert_1.default)(!user.isApproved, http_1.BAD_REQUEST, "User is already approved");
            const approvedDoctor = yield this._adminRepository.approveRequest(id);
            yield this._walletRespository.createWallet({
                userId: user._id,
                role: "Doctor"
            });
            yield this.__notificationRepository.deleteNotification(id);
            yield (0, sendMail_1.sendMail)(Object.assign({ to: user.name }, (0, DoctorApprovalTemplate_1.getApprovalEmailTemplate)(user.name, user.email)));
            return approvedDoctor;
        });
    }
    rejectRequest(id, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._adminRepository.rejectRequest(id);
            (0, appAssert_1.default)(response, http_1.BAD_REQUEST, "Unable to Reject Request . Please try again after few minutes");
            (0, appAssert_1.default)(response.isApproved, http_1.BAD_REQUEST, "User's request was already rejected");
            yield this._doctorRepository.deleteDoctorById(id);
            yield this._doctorRepository.deleteDoctorDetails(id);
            yield this.__notificationRepository.deleteNotification(id);
            yield (0, sendMail_1.sendMail)(Object.assign({ to: response.email }, (0, RequestRejectEmailTemplate_1.getRejectionEmailTemplate)(response.name, reason)));
        });
    }
    findAllDoctorsDetails() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._adminRepository.doctorDetails();
            return result;
        });
    }
    unblockUser(id, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = role === "user" /* Role.USER */ ? yield this._userRepository.findUserById(id) : yield this._doctorRepository.findDoctorByID(id);
            (0, appAssert_1.default)((user === null || user === void 0 ? void 0 : user.status) !== "active", http_1.BAD_REQUEST, "User is already active");
            const response = yield this._adminRepository.unblockById(id, role);
            return response;
        });
    }
    blockUser(id, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = role === "user" /* Role.USER */ ? yield this._userRepository.findUserById(id) : yield this._doctorRepository.findDoctorByID(id);
            (0, appAssert_1.default)((user === null || user === void 0 ? void 0 : user.status) !== "blocked", http_1.BAD_REQUEST, "User is already blocked");
            const response = yield this._adminRepository.blockById(id, role);
            (0, appAssert_1.default)(response, http_1.BAD_REQUEST, "User was not found. Or error in blocking the user");
            if (response) {
                yield this._sessionRepository.deleteMany(id);
            }
            const userSocketId = (0, socket_io_1.getReceiverSocketId)(user === null || user === void 0 ? void 0 : user._id);
            (0, emitNotification_1.suspendNotification)(userSocketId, "Your account has been suspended. Please contact with our team");
            return response;
        });
    }
    addingPremiumSubscription(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, type, price, features, planName }) {
            return yield this._premiumSubscriptionRepository.createSubscription({
                type,
                price,
                features,
                planName
            });
        });
    }
    editPremiumSubscription(_a, subscriptionId_1) {
        return __awaiter(this, arguments, void 0, function* ({ type, price, features, planName }, subscriptionId) {
            console.log("-----------------------");
            return yield this._premiumSubscriptionRepository.editPremiumSubscription(subscriptionId, {
                type,
                price,
                features,
                planName
            });
        });
    }
    deletePremiumSubscription(subscriptionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingSubscriptionPlan = yield this._premiumSubscriptionRepository.getSubscriptionById(subscriptionId);
            (0, appAssert_1.default)(existingSubscriptionPlan, http_1.BAD_REQUEST, "Subscription not found. Please try again.");
            yield this._premiumSubscriptionRepository.deletePremiumSubscription(subscriptionId);
        });
    }
    getAllPremiumSubscription() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._premiumSubscriptionRepository.getAllPremiumSubscription();
        });
    }
    adminDashboard(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userDetails = yield this._userRepository.userDetails();
            const doctorDetails = yield this._doctorRepository.getDoctorStatistics();
            const walletDetails = yield this._walletRespository.findWalletById(userId, "Admin");
            return {
                doctorDetails,
                userDetails,
                walletDetails
            };
        });
    }
};
exports.AdminUseCase = AdminUseCase;
exports.AdminUseCase = AdminUseCase = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)(IAdminRepository_1.IAdminRepositoryToken)),
    __param(1, (0, typedi_1.Inject)(ISessionRepository_1.ISessionRepositoryToken)),
    __param(2, (0, typedi_1.Inject)(INotificationRepository_1.INotificationRepositoryToken)),
    __param(3, (0, typedi_1.Inject)(IDoctorReposirtory_1.IDoctorRepositoryToken)),
    __param(4, (0, typedi_1.Inject)(IUserRepository_1.IUserRepositoryToken)),
    __param(5, (0, typedi_1.Inject)(IWalletRepository_1.IWalletRepositoryToken)),
    __param(6, (0, typedi_1.Inject)(IPremiumSubscription_1.IPremiumSubscriptionRepositoryToken)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], AdminUseCase);
