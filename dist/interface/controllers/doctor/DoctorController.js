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
exports.DoctorController = void 0;
const typedi_1 = require("typedi");
const DoctorUseCase_1 = require("../../../application/user-casers/DoctorUseCase");
const catchErrors_1 = __importDefault(require("../../../shared/utils/catchErrors"));
const doctorSchema_1 = require("../../validations/doctorSchema");
const setAuthCookies_1 = require("../../../shared/utils/setAuthCookies");
const http_1 = require("../../../shared/constants/http");
const doctor_details_schema_1 = require("../../validations/doctor.details.schema");
const userSchema_1 = require("../../validations/userSchema");
const jwt_1 = require("../../../shared/utils/jwt");
const bcrypt_1 = require("../../../shared/utils/bcrypt");
const appAssert_1 = __importDefault(require("../../../shared/utils/appAssert"));
let DoctorController = class DoctorController {
    constructor(_doctorUseCase) {
        this._doctorUseCase = _doctorUseCase;
        //Doctor Registration;
        this.registerHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const request = doctorSchema_1.doctorRegisterSchema.parse(Object.assign(Object.assign({}, req.body), { userAgent: req.headers["user-agent"] }));
            const { user } = yield this._doctorUseCase.registerDoctor(request);
            return res.status(http_1.CREATED).json({
                success: true,
                message: "Registration successfull . An OTP has been sent to your email",
                user,
            });
        }));
        // Register as Doctor 
        this.registerAsDoctorHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            console.log(req.body);
            const request = doctor_details_schema_1.doctorDetailsSchema.parse(Object.assign(Object.assign({}, req.body.formData), { userAgent: req.headers["user-agent"] }));
            const userId = (0, bcrypt_1.stringToObjectId)(req.body.userId);
            const doctorInfo = req.body.doctorInfo;
            const { doctorDetails } = yield this._doctorUseCase.registerAsDoctor({
                userId,
                details: request,
                doctorInfo,
            });
            return res.status(http_1.CREATED).json({
                success: true,
                doctorDetails,
                message: "Registration successfull . Please check your email",
            });
        }));
        // otp verification
        this.otpVerifyHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const userId = (0, bcrypt_1.stringToObjectId)(req.body.userId);
            const { code } = userSchema_1.otpVerificationSchema.parse(req.body);
            yield this._doctorUseCase.verifyOtp(code, userId);
            return res.status(http_1.OK).json({
                success: true,
                message: "Email was successfully verified . Now you can register as Doctor",
            });
        }));
        this.doctorLoginHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const request = userSchema_1.loginSchema.parse(Object.assign(Object.assign({}, req.body), { userAgent: req.headers["user-agent"] }));
            const { accessToken, refreshToken, user } = yield this._doctorUseCase.loginDoctor(request);
            return (0, setAuthCookies_1.setAuthCookies)({ res, accessToken, refreshToken })
                .status(http_1.OK)
                .json({
                    message: "Login successful",
                    response: Object.assign(Object.assign({}, user), { accessToken }),
                });
        }));
        this.logoutHandler = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const accessToken = req.cookies.accessToken;
            const { payload } = (0, jwt_1.verifyToken)(accessToken || "");
            if (payload) {
                yield this._doctorUseCase.logoutUser(payload);
            }
            return (0, setAuthCookies_1.clearAuthCookies)(res).status(http_1.OK).json({
                message: "Logout successful",
            });
        });
        //verfiy Email
        this.verifyEmailHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const verificationCode = doctorSchema_1.verificationCodeSchema.parse(req.params.code);
            yield this._doctorUseCase.verifyEmail(verificationCode);
            return res.status(http_1.OK).json({ message: "Email verified successfully" });
        }));
        this.updateDoctorDetailsHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const request = doctor_details_schema_1.doctorUpdateSchema.parse(req.body);
            const { userId } = req;
            const response = yield this._doctorUseCase.updateDoctorDetails(userId, request);
            return res.status(http_1.OK).json({
                success: true,
                message: "Details updated successfully",
                response,
            });
        }));
        this.updatePasswordHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId, role } = req;
            (0, appAssert_1.default)(userId, http_1.BAD_REQUEST, "User not authenticated. Please login");
            const currentPassword = doctorSchema_1.passwordSchema.parse(req.body.currentPassword);
            const newPassword = doctorSchema_1.passwordSchema.parse(req.body.newPassword);
            yield this._doctorUseCase.updatePassword({ userId, currentPassword, newPassword, role });
            return res.status(http_1.OK).json({
                success: true,
                message: "Password updated successfully",
            });
        }));
    }
};
exports.DoctorController = DoctorController;
exports.DoctorController = DoctorController = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)()),
    __metadata("design:paramtypes", [DoctorUseCase_1.DoctorUseCase])
], DoctorController);
