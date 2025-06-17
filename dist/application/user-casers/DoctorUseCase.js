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
exports.DoctorUseCase = void 0;
const typedi_1 = require("typedi");
const appAssert_1 = __importDefault(require("../../shared/utils/appAssert"));
const http_1 = require("../../shared/constants/http");
const mongoose_1 = __importDefault(require("mongoose"));
const date_1 = require("../../shared/utils/date");
const IVerificaitonCodeRepository_1 = require("../repositories/IVerificaitonCodeRepository");
const sendMail_1 = require("../../shared/constants/sendMail");
const ISessionRepository_1 = require("../repositories/ISessionRepository");
const jwt_1 = require("../../shared/utils/jwt");
const IDoctorReposirtory_1 = require("../repositories/IDoctorReposirtory");
const emialTemplates_1 = require("../../shared/utils/emialTemplates");
const IOtpReposirtory_1 = require("../repositories/IOtpReposirtory");
const doctorEmailTemplates_1 = require("../../shared/utils/doctorEmailTemplates");
const INotificationRepository_1 = require("../repositories/INotificationRepository");
const cloudinary_1 = __importDefault(require("../../infrastructure/config/cloudinary"));
const builder_1 = require("../../shared/utils/builder");
const doctorHelper_1 = require("../../shared/utils/doctorHelper");
const IUserRepository_1 = require("../repositories/IUserRepository");
let DoctorUseCase = class DoctorUseCase {
    constructor(_doctorRepository, verificationCodeRepository, _sessionRepository, otpRepository, __notificationRepository, _userRepository) {
        this._doctorRepository = _doctorRepository;
        this.verificationCodeRepository = verificationCodeRepository;
        this._sessionRepository = _sessionRepository;
        this.otpRepository = otpRepository;
        this.__notificationRepository = __notificationRepository;
        this._userRepository = _userRepository;
    }
    registerDoctor(details) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingDoctor = yield this._doctorRepository.findDoctorByEmail(details.email);
            (0, appAssert_1.default)(!existingDoctor, http_1.CONFLICT, "Email already exists");
            // create doctor
            const newDoctor = yield this._doctorRepository.createDoctor({
                email: details.email,
                password: details.password,
                name: details.name,
                role: "doctor" /* Role.DOCTOR */,
                provider: "email",
            });
            const doctor = yield this._doctorRepository.createDoctor(newDoctor);
            // send verfication email
            const otpCode = (0, builder_1.IcreateOtp)(doctor._id, "EMAIL_VERIFICATION" /* OtpCodeTypes.EmailVerification */);
            const newOtp = yield this.otpRepository.saveOtp(otpCode);
            yield (0, sendMail_1.sendMail)(Object.assign({ to: doctor.email }, (0, emialTemplates_1.getVerifyEmailTemplates)(newOtp.code, newDoctor.name)));
            return {
                user: doctor
            };
        });
    }
    // register as doctor;
    registerAsDoctor(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, details, doctorInfo }) {
            const existingDoctor = yield this._doctorRepository.findDoctorDetails(userId);
            (0, appAssert_1.default)(!existingDoctor, http_1.CONFLICT, "Email already exists");
            const doctor = yield this._doctorRepository.findDoctorByID(userId);
            let doctorName;
            if (doctor) {
                doctorName = doctor.name;
            }
            // upload image to cloudinary>>>>>
            const uploadResponse = details.certificate
                ? yield cloudinary_1.default.uploader.upload(details.certificate, {
                    resource_type: "auto",
                })
                : null;
            const doctorDetails = (0, doctorHelper_1.IcreateDoctorDetails)(userId, details.experience, details.consultationFees, details.contactPhoneNumber, details.professionalEmail, details.officeAddress, details.clinicLocations, details.consultationLanguages, details.primarySpecialty, details.medicalLicenseNumber, details.gender, details.professionalTitle, details.bio, uploadResponse === null || uploadResponse === void 0 ? void 0 : uploadResponse.secure_url);
            //add to the database;
            const newDoctorDetails = yield this._doctorRepository.createDoctorDetails(doctorDetails);
            const newDoctorEmail = newDoctorDetails.professionalEmail;
            yield (0, sendMail_1.sendMail)(Object.assign({ to: newDoctorEmail }, (0, doctorEmailTemplates_1.getPendingApprovalEmailTemplate)()));
            let message = `${doctorName} has registered as a doctor and is waiting for approval.`;
            const notification = yield this.__notificationRepository.createNotification({
                userId,
                role: "admin" /* Role.ADMIN */,
                type: "doctor_registration" /* NotificationType.DoctorRegistration */,
                message,
                status: "pending",
                metadata: Object.assign(Object.assign({}, doctorInfo), newDoctorDetails),
                read: false,
            });
            const new_notification = yield this.__notificationRepository.createNotification(notification);
            return {
                doctorDetails: newDoctorDetails,
                notification: new_notification,
            };
        });
    }
    //verify email
    verifyEmail(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const valideCode = yield this.verificationCodeRepository.findVerificationCode(code, "EMAIL_VERIFICATION" /* VerificationCodeTypes.EmailVerification */);
            (0, appAssert_1.default)(valideCode, http_1.NOT_FOUND, "Invalid or expired verification code");
            const updatedUser = yield this._doctorRepository.updateUserById(valideCode.userId, { isVerified: true });
            (0, appAssert_1.default)(updatedUser, http_1.INTERNAL_SERVER_ERROR, "Failed to verify email");
            yield this.verificationCodeRepository.deleteVerificationCode(valideCode.userId);
            return updatedUser;
        });
    }
    verifyOtp(code, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const validCode = yield this.otpRepository.findOtpById(code, userId, "EMAIL_VERIFICATION" /* OtpCodeTypes.EmailVerification */);
            (0, appAssert_1.default)(validCode, http_1.NOT_FOUND, "Invalid code");
            if (validCode.expiresAt < new Date()) {
                (0, appAssert_1.default)(false, http_1.BAD_REQUEST, "OTP has expired");
            }
            const updatedUser = yield this._doctorRepository.updateUserById(validCode.userId, { isVerified: true });
            (0, appAssert_1.default)(updatedUser, http_1.INTERNAL_SERVER_ERROR, "Failed to verify email");
            yield this.otpRepository.deleteOtp(validCode._id);
            return { user: updatedUser };
        });
    }
    loginDoctor(doctorData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const existingDoctor = yield this._doctorRepository.findDoctorByEmail(doctorData.email);
            (0, appAssert_1.default)(existingDoctor, http_1.UNAUTHORIZED, "Email not exists. Please register first");
            (0, appAssert_1.default)(existingDoctor.status !== "blocked", http_1.UNAUTHORIZED, "Your account has been suspended. Please contact support for more information.");
            (0, appAssert_1.default)(existingDoctor.isApproved, http_1.UNAUTHORIZED, "Your request is still under process . Please check your email for updates");
            const isValidUser = yield existingDoctor.comparePassword(doctorData.password);
            (0, appAssert_1.default)(isValidUser, http_1.UNAUTHORIZED, "Invalid Email or Password");
            const newSession = (0, builder_1.IcreateSession)(existingDoctor._id, "doctor" /* Role.DOCTOR */, doctorData.userAgent, (0, date_1.oneYearFromNow)());
            const session = yield this._sessionRepository.createSession(newSession);
            const sessionInfo = {
                sessionId: (_a = session._id) !== null && _a !== void 0 ? _a : new mongoose_1.default.Types.ObjectId(),
                role: "doctor" /* Role.DOCTOR */,
            };
            const userId = existingDoctor._id;
            const accessToken = (0, jwt_1.signToken)(Object.assign(Object.assign({}, sessionInfo), { userId: userId, role: "doctor" /* Role.DOCTOR */ }));
            const refreshToken = (0, jwt_1.signToken)(sessionInfo, jwt_1.refreshTokenSignOptions);
            return {
                user: {
                    _id: existingDoctor._id,
                    name: existingDoctor.name,
                    email: existingDoctor.email,
                    profilePicture: existingDoctor.profilePicture,
                    role: existingDoctor.role,
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
    updateDoctorDetails(userId, details) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, appAssert_1.default)(userId, http_1.BAD_REQUEST, "Invalid userId. Please login again.");
            const doctorDetails = yield this._doctorRepository.findDoctorByID(userId);
            (0, appAssert_1.default)(doctorDetails, http_1.NOT_FOUND, "User not found");
            return yield this._doctorRepository.updateDoctorDetailsByDocId(userId, details);
        });
    }
    updatePassword(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, currentPassword, newPassword, role }) {
            (0, appAssert_1.default)(currentPassword, http_1.BAD_REQUEST, "Current password is required");
            (0, appAssert_1.default)(newPassword, http_1.BAD_REQUEST, "New password is required");
            const isExistingUser = role === "doctor" /* Role.DOCTOR */
                ? yield this._doctorRepository.findDoctorByID(userId)
                : yield this._userRepository.findUserById(userId);
            (0, appAssert_1.default)(isExistingUser, http_1.NOT_FOUND, "User not found");
            const isValidPassword = yield isExistingUser.comparePassword(currentPassword);
            (0, appAssert_1.default)(isValidPassword, http_1.BAD_REQUEST, "Current password is incorrect");
            const isSamePassword = yield isExistingUser.comparePassword(newPassword);
            (0, appAssert_1.default)(!isSamePassword, http_1.BAD_REQUEST, "New password cannot be the same as the current password");
            return yield this._doctorRepository.updatePassword(userId, newPassword, role);
        });
    }
};
exports.DoctorUseCase = DoctorUseCase;
exports.DoctorUseCase = DoctorUseCase = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)(IDoctorReposirtory_1.IDoctorRepositoryToken)),
    __param(1, (0, typedi_1.Inject)(IVerificaitonCodeRepository_1.IVerficaitonCodeRepositoryToken)),
    __param(2, (0, typedi_1.Inject)(ISessionRepository_1.ISessionRepositoryToken)),
    __param(3, (0, typedi_1.Inject)(IOtpReposirtory_1.IOtpReposirtoryCodeToken)),
    __param(4, (0, typedi_1.Inject)(INotificationRepository_1.INotificationRepositoryToken)),
    __param(5, (0, typedi_1.Inject)(IUserRepository_1.IUserRepositoryToken)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], DoctorUseCase);
