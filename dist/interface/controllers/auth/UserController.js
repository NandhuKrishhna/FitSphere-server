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
exports.UserController = void 0;
const catchErrors_1 = __importDefault(require("../../../shared/utils/catchErrors"));
const typedi_1 = require("typedi");
const http_1 = require("../../../shared/constants/http");
const RegisterUserUseCase_1 = require("../../../application/user-casers/RegisterUserUseCase");
const userSchema_1 = require("../../validations/userSchema");
const setAuthCookies_1 = require("../../../shared/utils/setAuthCookies");
const jwt_1 = require("../../../shared/utils/jwt");
const appAssert_1 = __importDefault(require("../../../shared/utils/appAssert"));
const bcrypt_1 = require("../../../shared/utils/bcrypt");
let UserController = class UserController {
    constructor(_registerUserUseCase) {
        this._registerUserUseCase = _registerUserUseCase;
        //** @description: This method is used to register a new user.
        this.registerHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            console.log(req.body);
            const request = userSchema_1.userRegisterSchema.parse(Object.assign(Object.assign({}, req.body), { userAgent: req.headers["user-agent"] }));
            const { user, accessToken, refreshToken } = yield this._registerUserUseCase.registerUser(request);
            return (0, setAuthCookies_1.setAuthCookies)({ res, accessToken, refreshToken })
                .status(http_1.CREATED)
                .json({
                success: true,
                message: `Registration successfull. An OTP has been sent to ${user.email}`,
                response: Object.assign(Object.assign({}, user), { accessToken }),
            });
        }));
        //** @description: This method is used to verify the OTP sent to the user during registration.
        this.otpVerifyHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const userId = (0, bcrypt_1.stringToObjectId)(req.body.userId);
            const { code } = userSchema_1.otpVerificationSchema.parse(req.body);
            yield this._registerUserUseCase.verifyOtp(code, userId);
            return res.status(http_1.OK).json({
                success: true,
                message: "Email was successfully verfied",
            });
        }));
        //** @description: This method is used to login a user.
        this.loginHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const request = userSchema_1.loginSchema.parse(Object.assign(Object.assign({}, req.body), { userAgent: req.headers["user-agent"] }));
            const { accessToken, refreshToken, user } = yield this._registerUserUseCase.loginUser(request);
            return (0, setAuthCookies_1.setAuthCookies)({ res, accessToken, refreshToken })
                .status(http_1.OK)
                .json({
                message: "Login successful",
                response: Object.assign(Object.assign({}, user), { accessToken }),
            });
        }));
        //** @description: This method is used to logout a user.
        this.logoutHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const accessToken = req.cookies.accessToken;
            const { payload } = (0, jwt_1.verfiyToken)(accessToken || "");
            if (payload) {
                yield this._registerUserUseCase.logoutUser(payload);
            }
            return (0, setAuthCookies_1.clearAuthCookies)(res).status(http_1.OK).json({
                message: "Logout successful",
            });
        }));
        //** @description: This method is used to refresh the access token using the refresh token.
        this.refreshHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const refreshToken = req.cookies.refreshToken;
            (0, appAssert_1.default)(refreshToken, http_1.UNAUTHORIZED, "Missing refresh token, please log in again");
            const { accessToken, newRefreshToken } = yield this._registerUserUseCase.setRefreshToken(refreshToken);
            if (newRefreshToken) {
                res.cookie("refreshToken", newRefreshToken, (0, setAuthCookies_1.generateRefreshTokenCookieOptions)());
            }
            return res.status(http_1.OK).cookie("accessToken", accessToken, (0, setAuthCookies_1.getAccessTokenCookieOptions)()).json({
                message: "Access token refreshed",
                accessToken,
            });
        }));
        //** @description: This method is used to verify the email of the user.
        this.verifyEmailHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const verificationCode = userSchema_1.verificationCodeSchema.parse(req.params.code);
            yield this._registerUserUseCase.verifyEmail(verificationCode);
            return res.status(http_1.OK).json({
                message: "Email was successfully verfied",
            });
        }));
        //** @description: This method is used to send a password reset email to the user.
        this.sendPasswordResetHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const role = req.body.role;
            const email = userSchema_1.emailSchema.parse((_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.email);
            const { user } = yield this._registerUserUseCase.sendPasswordResetEmail(email, role);
            return res.status(http_1.OK).json({
                success: true,
                message: "Password reset email sent successfully",
                email: user.email,
                userId: user._id,
            });
        }));
        //** @description: This method is used to verify the OTP sent to the user for password reset.
        this.verifyResetPasswordCode = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const userId = (0, bcrypt_1.stringToObjectId)(req.body.userId);
            const { code } = userSchema_1.otpVerificationSchema.parse(req.body);
            yield this._registerUserUseCase.verifyResetPassword(userId, code);
            return res.status(http_1.OK).json({
                success: true,
                message: "Email was successfully verfied",
            });
        }));
        //** @description: This method is used to reset the password of the user.
        this.resetPasswordHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const role = req.body.role;
            const userId = (0, bcrypt_1.stringToObjectId)(req.body.userId);
            const request = userSchema_1.resetPasswordSchema.parse(req.body);
            yield this._registerUserUseCase.resetPassword(Object.assign({ userId, role }, request));
            return (0, setAuthCookies_1.clearTempAuthCookies)(res).status(http_1.OK).json({
                message: "Password reset successful",
            });
        }));
        //** @description: This method is used to resend the verification code to the user.
        this.resendPasswordHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const role = req.body.role;
            const email = userSchema_1.emailSchema.parse(req.body.email);
            const { user } = yield this._registerUserUseCase.resendVerificaitonCode(email, role);
            return res.status(http_1.OK).json({
                message: `Verification code sent to ${user.email}`,
            });
        }));
        //** @description: This method is used to verify the Google login.
        this.googleAuthHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const code = req.query.code;
            if (typeof code !== 'string') {
                throw new Error('Invalid code query parameter');
            }
            const { accessToken, refreshToken, user } = yield this._registerUserUseCase.googleAuth(code);
            return (0, setAuthCookies_1.setAuthCookies)({ res, accessToken, refreshToken })
                .status(http_1.OK)
                .json({
                message: "Google login successful",
                response: Object.assign(Object.assign({}, user), { accessToken }),
            });
        }));
    }
};
exports.UserController = UserController;
exports.UserController = UserController = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)()),
    __metadata("design:paramtypes", [RegisterUserUseCase_1.RegisterUserUseCase])
], UserController);
