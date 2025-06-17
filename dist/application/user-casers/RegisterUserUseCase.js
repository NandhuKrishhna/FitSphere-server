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
exports.RegisterUserUseCase = void 0;
const typedi_1 = require("typedi");
const IUserRepository_1 = require("../repositories/IUserRepository");
const IVerificaitonCodeRepository_1 = require("../repositories/IVerificaitonCodeRepository");
const mongoose_1 = __importDefault(require("mongoose"));
const date_1 = require("../../shared/utils/date");
const ISessionRepository_1 = require("../repositories/ISessionRepository");
const appAssert_1 = __importDefault(require("../../shared/utils/appAssert"));
const http_1 = require("../../shared/constants/http");
const jwt_1 = require("../../shared/utils/jwt");
const jwt_2 = require("../../shared/utils/jwt");
const sendMail_1 = require("../../shared/constants/sendMail");
const emialTemplates_1 = require("../../shared/utils/emialTemplates");
const bcrypt_1 = require("../../shared/utils/bcrypt");
const IOtpReposirtory_1 = require("../repositories/IOtpReposirtory");
const IWalletRepository_1 = require("../repositories/IWalletRepository");
const builder_1 = require("../../shared/utils/builder");
const IDoctorReposirtory_1 = require("../repositories/IDoctorReposirtory");
const googleAuth_1 = require("../../infrastructure/config/googleAuth");
const axios_1 = __importDefault(require("axios"));
const contants_1 = require("../../shared/constants/contants");
const IUserSubscriptionRepository_1 = require("../repositories/IUserSubscriptionRepository");
let RegisterUserUseCase = class RegisterUserUseCase {
    constructor(_userRepository, verificationCodeRepository, _sessionRepository, otpRepository, _walletRespository, doctorRespository, userSubscriptionRepository) {
        this._userRepository = _userRepository;
        this.verificationCodeRepository = verificationCodeRepository;
        this._sessionRepository = _sessionRepository;
        this.otpRepository = otpRepository;
        this._walletRespository = _walletRespository;
        this.doctorRespository = doctorRespository;
        this.userSubscriptionRepository = userSubscriptionRepository;
    }
    //** de
    registerUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const existingUser = yield this._userRepository.findUserByEmail(userData.email);
            (0, appAssert_1.default)(!existingUser, http_1.CONFLICT, "Email already in use");
            const user = yield this._userRepository.createUser({
                name: userData.name,
                email: userData.email,
                password: userData.password,
                provider: "email",
                role: "user" /* Role.USER */,
            });
            (0, appAssert_1.default)(user, http_1.INTERNAL_SERVER_ERROR, "Error creating user . Please try again");
            const otpCode = (0, builder_1.IcreateOtp)(user._id, "EMAIL_VERIFICATION" /* OtpCodeTypes.EmailVerification */);
            const newOtp = yield this.otpRepository.saveOtp(otpCode);
            yield (0, sendMail_1.sendMail)(Object.assign({ to: user.email }, (0, emialTemplates_1.getVerifyEmailTemplates)(newOtp.code, user.name)));
            const newSession = (0, builder_1.IcreateSession)(user._id, "user" /* Role.USER */, userData.userAgent, (0, date_1.oneYearFromNow)());
            const session = yield this._sessionRepository.createSession(newSession);
            yield this._walletRespository.createWallet({
                userId: user._id,
                role: "User",
            });
            const sessionInfo = {
                sessionId: (_a = session._id) !== null && _a !== void 0 ? _a : new mongoose_1.default.Types.ObjectId(),
                role: "user" /* Role.USER */,
            };
            const userId = user._id;
            const accessToken = (0, jwt_1.signToken)(Object.assign(Object.assign({}, sessionInfo), { userId: userId, role: "user" /* Role.USER */ }));
            const refreshToken = (0, jwt_1.signToken)(sessionInfo, jwt_2.refreshTokenSignOptions);
            return {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    profilePicture: user.profilePicture,
                    role: user.role,
                },
                accessToken,
                refreshToken,
            };
        });
    }
    verifyOtp(code, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const validCode = yield this.otpRepository.findOtpById(code, userId, "EMAIL_VERIFICATION" /* OtpCodeTypes.EmailVerification */);
            (0, appAssert_1.default)(validCode, http_1.NOT_FOUND, "Invalid code or expired . Please try again");
            (0, appAssert_1.default)(validCode.expiresAt > new Date(), http_1.BAD_REQUEST, "OTP has expired");
            const updatedUser = yield this._userRepository.updateUserById(validCode.userId, { isVerfied: true });
            (0, appAssert_1.default)(updatedUser, http_1.INTERNAL_SERVER_ERROR, "Failed to verify email");
            yield this.userSubscriptionRepository.createDefaultSubscription(updatedUser._id);
            yield this.otpRepository.deleteOtp(validCode._id);
            return {
                user: updatedUser,
            };
        });
    }
    loginUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const existingUser = yield this._userRepository.findUserByEmail(userData.email);
            (0, appAssert_1.default)((existingUser === null || existingUser === void 0 ? void 0 : existingUser.status) !== "blocked", http_1.UNAUTHORIZED, "Your account is suspened . Please contact with our team");
            (0, appAssert_1.default)(existingUser, http_1.UNAUTHORIZED, "Invalid email or password");
            if (!existingUser.isVerfied) {
                const otpCode = (0, builder_1.IcreateOtp)(existingUser._id, "EMAIL_VERIFICATION" /* OtpCodeTypes.EmailVerification */);
                const newOtp = yield this.otpRepository.saveOtp(otpCode);
                yield (0, sendMail_1.sendMail)(Object.assign({ to: existingUser.email }, (0, emialTemplates_1.getVerifyEmailTemplates)(newOtp.code, existingUser.name)));
                (0, appAssert_1.default)(false, http_1.UNAUTHORIZED, builder_1.ERRORS.EMAIL_VERIFICATION_REQUIRED);
            }
            const isValid = yield existingUser.comparePassword(userData.password);
            (0, appAssert_1.default)(isValid, http_1.UNAUTHORIZED, "Invalid Email or Password");
            const newSession = (0, builder_1.IcreateSession)(existingUser._id, "user" /* Role.USER */, userData.userAgent, (0, date_1.oneYearFromNow)());
            const session = yield this._sessionRepository.createSession(newSession);
            const sessionInfo = {
                sessionId: (_a = session._id) !== null && _a !== void 0 ? _a : new mongoose_1.default.Types.ObjectId(),
                role: "user" /* Role.USER */,
            };
            const userId = existingUser._id;
            const accessToken = (0, jwt_1.signToken)(Object.assign(Object.assign({}, sessionInfo), { userId: userId, role: "user" /* Role.USER */ }));
            const refreshToken = (0, jwt_1.signToken)(sessionInfo, jwt_2.refreshTokenSignOptions);
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
    logoutUser(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._sessionRepository.findByIdAndDelete(payload.sessionId);
        });
    }
    setRefreshToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const { payload } = (0, jwt_1.verfiyToken)(refreshToken, {
                secret: jwt_2.refreshTokenSignOptions.secret,
            });
            (0, appAssert_1.default)(payload, http_1.UNAUTHORIZED, "Invalid refresh token");
            const session = yield this._sessionRepository.findById(payload.sessionId);
            (0, appAssert_1.default)((session === null || session === void 0 ? void 0 : session.role) === payload.role, http_1.UNAUTHORIZED, "UnAuthorized! Please Login Again");
            (0, appAssert_1.default)(session && session.expiresAt.getTime() > Date.now(), http_1.UNAUTHORIZED, "Session expired");
            const sessionNeedsRefresh = session.expiresAt.getTime() - Date.now() <= date_1.ONE_DAY_MS;
            if (sessionNeedsRefresh) {
                yield this._sessionRepository.updateSession(session._id, {
                    expiresAt: (0, date_1.thirtyDaysFromNow)(),
                });
            }
            const newRefreshToken = sessionNeedsRefresh
                ? (0, jwt_1.signToken)({
                    sessionId: session._id,
                    role: payload.role,
                }, jwt_2.refreshTokenSignOptions)
                : refreshToken;
            const accessToken = (0, jwt_1.signToken)({
                userId: session.userId,
                sessionId: session._id,
                role: session.role,
            });
            return {
                accessToken,
                newRefreshToken,
            };
        });
    }
    verifyEmail(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const valideCode = yield this.verificationCodeRepository.findVerificationCode(code, "EMAIL_VERIFICATION" /* VerificationCodeTypes.EmailVerification */);
            (0, appAssert_1.default)(valideCode, http_1.NOT_FOUND, "Invalid or expired verification code");
            const updatedUser = yield this._userRepository.updateUserById(valideCode.userId, { isVerfied: true });
            (0, appAssert_1.default)(updatedUser, http_1.INTERNAL_SERVER_ERROR, "Failed to verify email");
            yield this.verificationCodeRepository.deleteVerificationCode(valideCode.userId);
            return {
                user: updatedUser,
            };
        });
    }
    // handler for user forgot password [user enter the email for getting the reset otp]
    sendPasswordResetEmail(email, role) {
        return __awaiter(this, void 0, void 0, function* () {
            let user;
            role === "user" /* Role.USER */
                ? (user = yield this._userRepository.findUserByEmail(email))
                : (user = yield this.doctorRespository.findDoctorByEmail(email));
            (0, appAssert_1.default)(user, http_1.NOT_FOUND, "User not found");
            (0, appAssert_1.default)(user.status !== "blocked", http_1.UNAUTHORIZED, "Your account is suspended. Please contact with our team");
            const fiveMinAgo = (0, date_1.fiveMinutesAgo)();
            const count = yield this.otpRepository.countVerificationCodes(user._id, "PASSWORD_RESET" /* OtpCodeTypes.PasswordReset */, fiveMinAgo);
            (0, appAssert_1.default)(count <= 1, http_1.TOO_MANY_REQUESTS, "Too many requests. Please try again later.");
            const otpCode = (0, builder_1.IcreateOtp)(user._id, "PASSWORD_RESET" /* OtpCodeTypes.PasswordReset */);
            const newOtp = yield this.otpRepository.saveOtp(otpCode);
            yield (0, sendMail_1.sendMail)(Object.assign({ to: user.email }, (0, emialTemplates_1.getResetPasswordEmailTemplates)(newOtp.code, user.name)));
            return {
                user: user,
            };
        });
    }
    // handler for verifing the otp  and redirecting to the reset password page
    verifyResetPassword(userId, code) {
        return __awaiter(this, void 0, void 0, function* () {
            const validCode = yield this.otpRepository.findOtpById(code, userId, "PASSWORD_RESET" /* OtpCodeTypes.PasswordReset */);
            (0, appAssert_1.default)(validCode, http_1.NOT_FOUND, "Invalid code");
            (0, appAssert_1.default)(validCode.expiresAt > new Date(), http_1.BAD_REQUEST, "OTP has expired");
            return {
                user: validCode.userId,
            };
        });
    }
    // handler for setting the new password
    resetPassword(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, role, password }) {
            let existingUser;
            role === "user" /* Role.USER */
                ? (existingUser = yield this._userRepository.findUserById(userId))
                : (existingUser = yield this.doctorRespository.findDoctorByID(userId));
            if (!existingUser) {
                (0, appAssert_1.default)(false, http_1.NOT_FOUND, "User not found");
            }
            const isOldPassword = yield existingUser.comparePassword(password);
            (0, appAssert_1.default)(!isOldPassword, http_1.BAD_REQUEST, "New password cannot be the same as the old password");
            // if not set password
            const hashedPassword = yield (0, bcrypt_1.hashPassword)(password);
            let updatedUser;
            role === "user" /* Role.USER */
                ? (updatedUser = yield this._userRepository.updateUserById(userId, { password: hashedPassword }))
                : (updatedUser = yield this.doctorRespository.updateUserById(userId, { password: hashedPassword }));
            (0, appAssert_1.default)(updatedUser, http_1.NOT_FOUND, "User not found");
            yield this.otpRepository.deleteOtpByUserId(userId);
            yield this._sessionRepository.deleteSessionByID(userId);
            return {
                user: updatedUser,
            };
        });
    }
    // handler for resend the otp code for the user
    resendVerificaitonCode(email, role) {
        return __awaiter(this, void 0, void 0, function* () {
            let user;
            role === "user" /* Role.USER */
                ? (user = yield this._userRepository.findUserByEmail(email))
                : (user = yield this.doctorRespository.findDoctorByEmail(email));
            (0, appAssert_1.default)(user, http_1.NOT_FOUND, "User not found");
            yield this.otpRepository.deleteOtpByUserId(user._id);
            const otpCode = (0, builder_1.IcreateOtp)(user._id, "EMAIL_VERIFICATION" /* OtpCodeTypes.EmailVerification */);
            const newOtp = yield this.otpRepository.saveOtp(otpCode);
            yield (0, sendMail_1.sendMail)(Object.assign({ to: user.email }, (0, emialTemplates_1.getVerifyEmailTemplates)(newOtp.code, user.name)));
            return {
                otpCode: newOtp.code,
                user: user,
            };
        });
    }
    googleAuth(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const googleResponse = yield googleAuth_1.oauth2Client.getToken(code);
            googleAuth_1.oauth2Client.setCredentials(googleResponse.tokens);
            const userRes = yield axios_1.default.get(`${contants_1.GOOGLE_USER_INFO_URL}&access_token=${googleResponse.tokens.access_token}`);
            const { email, name, picture } = userRes.data;
            let user = yield this._userRepository.findUserByEmail(email);
            let isNewUser = false;
            if (!user) {
                isNewUser = true;
                user = yield this._userRepository.createUser({
                    name,
                    email,
                    profilePicture: picture,
                    role: "user" /* Role.USER */,
                    provider: "google",
                    isVerfied: true,
                });
                const newSession = (0, builder_1.IcreateSession)(user._id, "user" /* Role.USER */, "", (0, date_1.oneYearFromNow)());
                yield this._sessionRepository.createSession(newSession);
                yield this._walletRespository.createWallet({
                    userId: user._id,
                    role: "User",
                });
                yield this.userSubscriptionRepository.createDefaultSubscription(user._id);
            }
            const sessionInfo = {
                sessionId: new mongoose_1.default.Types.ObjectId(),
                role: "user" /* Role.USER */,
            };
            const userId = user._id;
            const accessToken = (0, jwt_1.signToken)(Object.assign(Object.assign({}, sessionInfo), { userId: userId, role: "user" /* Role.USER */ }));
            const refreshToken = (0, jwt_1.signToken)(sessionInfo, jwt_2.refreshTokenSignOptions);
            return {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    profilePicture: user.profilePicture,
                    role: user.role,
                    isNewUser,
                },
                accessToken,
                refreshToken,
            };
        });
    }
};
exports.RegisterUserUseCase = RegisterUserUseCase;
exports.RegisterUserUseCase = RegisterUserUseCase = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)(IUserRepository_1.IUserRepositoryToken)),
    __param(1, (0, typedi_1.Inject)(IVerificaitonCodeRepository_1.IVerficaitonCodeRepositoryToken)),
    __param(2, (0, typedi_1.Inject)(ISessionRepository_1.ISessionRepositoryToken)),
    __param(3, (0, typedi_1.Inject)(IOtpReposirtory_1.IOtpReposirtoryCodeToken)),
    __param(4, (0, typedi_1.Inject)(IWalletRepository_1.IWalletRepositoryToken)),
    __param(5, (0, typedi_1.Inject)(IDoctorReposirtory_1.IDoctorRepositoryToken)),
    __param(6, (0, typedi_1.Inject)(IUserSubscriptionRepository_1.IUserSubscriptionRepositoryToken)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], RegisterUserUseCase);
