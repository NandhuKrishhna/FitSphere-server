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
exports.AdminController = void 0;
const catchErrors_1 = __importDefault(require("../../../shared/utils/catchErrors"));
const userSchema_1 = require("../../validations/userSchema");
const typedi_1 = require("typedi");
const AdminUseCase_1 = require("../../../application/user-casers/AdminUseCase");
const setAuthCookies_1 = require("../../../shared/utils/setAuthCookies");
const http_1 = require("../../../shared/constants/http");
const jwt_1 = require("../../../shared/utils/jwt");
const bcrypt_1 = require("../../../shared/utils/bcrypt");
const premiumSubscriptionSchema_1 = __importDefault(require("../../validations/premiumSubscriptionSchema"));
const appAssert_1 = __importDefault(require("../../../shared/utils/appAssert"));
let AdminController = class AdminController {
    constructor(adminUseCase) {
        this.adminUseCase = adminUseCase;
        this.loginHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const doctor = userSchema_1.loginSchema.parse(Object.assign(Object.assign({}, req.body), { userAgent: req.headers["user-agent"] }));
            const { user, accessToken, refreshToken } = yield this.adminUseCase.adminLogin(doctor);
            (0, setAuthCookies_1.setAuthCookies)({ res, accessToken, refreshToken });
            return res.status(http_1.OK).json({
                success: true,
                message: " Admin Login successfull",
                response: Object.assign(Object.assign({}, user), { accessToken: accessToken }),
            });
        }));
        this.getAllUsersHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const queryParams = req.query;
            const users = yield this.adminUseCase.getAllUsers(queryParams);
            return res.status(http_1.OK).json({
                success: true,
                users,
            });
        }));
        this.getAllDoctorsHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const queryParams = req.query;
            const doctors = yield this.adminUseCase.getAllDoctors(queryParams);
            return res.status(http_1.OK).json({
                success: true,
                doctors,
            });
        }));
        this.logoutHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const accessToken = req.cookies.accessToken;
            const { payload } = (0, jwt_1.verfiyToken)(accessToken || "");
            if (payload) {
                yield this.adminUseCase.logoutAdmin(payload);
            }
            return (0, setAuthCookies_1.clearAuthCookies)(res).status(http_1.OK).json({
                message: "Logout successful",
            });
        }));
        this.notificationHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const notification = yield this.adminUseCase.getNotification();
            return res.status(http_1.OK).json({
                success: true,
                notification,
            });
        }));
        this.approveRequestHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.body;
            const updatedDoctor = yield this.adminUseCase.approveRequest(id);
            return res.status(http_1.OK).json({
                success: true,
                message: "Request Approved",
                newDoctor: updatedDoctor,
            });
        }));
        this.rejectRequestHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { id, reason } = req.body;
            yield this.adminUseCase.rejectRequest(id, reason);
            return res.status(http_1.OK).json({
                success: true,
                message: "Request Rejected",
            });
        }));
        this.getAllDoctorWithDetails = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const doctorsWithDetails = yield this.adminUseCase.findAllDoctorsDetails();
            res.status(http_1.OK).json({
                success: true,
                message: "Doctor Details  fetch successfully ",
                doctorsWithDetails,
            });
        }));
        this.unblockUserHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { id, role } = req.body;
            const objectId = (0, bcrypt_1.stringToObjectId)(id);
            const response = yield this.adminUseCase.unblockUser(objectId, role);
            return res.status(http_1.OK).json({
                success: true,
                message: "User unblocked successfully",
                updatedUser: response
            });
        }));
        this.blockUserHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { id, role } = req.body;
            const objectId = (0, bcrypt_1.stringToObjectId)(id);
            const response = yield this.adminUseCase.blockUser(objectId, role);
            console.log(response);
            return res.status(http_1.OK).json({
                success: true,
                message: "User blocked successfully",
                updatedUser: response
            });
        }));
        this.addingPremiumSubscription = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req;
            const { type, price, features, planName } = premiumSubscriptionSchema_1.default.parse(Object.assign({}, req.body));
            const response = yield this.adminUseCase.addingPremiumSubscription({
                userId,
                type,
                price,
                features,
                planName
            });
            return res.status(http_1.CREATED).json({
                success: true,
                message: "Premium subscription added successfully",
                newPremiumSubscription: response,
            });
        }));
        this.editPremiumSubscription = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            console.log("Request", req.body);
            const { type, price, features, planName } = premiumSubscriptionSchema_1.default.parse(Object.assign({}, req.body));
            const subscriptionId = (0, bcrypt_1.stringToObjectId)(req.body._id);
            (0, appAssert_1.default)(subscriptionId, http_1.BAD_REQUEST, "Invalid subscription id");
            const response = yield this.adminUseCase.editPremiumSubscription({
                type,
                price,
                features,
                planName
            }, subscriptionId);
            return res.status(http_1.OK).json({
                success: true,
                message: "Premium subscription edited successfully",
                updatedPremiumSubscription: response
            });
        }));
        this.deletePremiumSubscription = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const subcriptionId = (0, bcrypt_1.stringToObjectId)(id);
            yield this.adminUseCase.deletePremiumSubscription(subcriptionId);
            return res.status(http_1.OK).json({
                success: true,
                message: "Premium subscription deleted successfully",
            });
        }));
        this.getAllPremiumSubscription = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.adminUseCase.getAllPremiumSubscription();
            return res.status(http_1.OK).json({
                success: true,
                subscriptionPlan: response
            });
        }));
        this.adminDasBoardHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req;
            const response = yield this.adminUseCase.adminDashboard(userId);
            return res.status(http_1.OK).json(Object.assign({ success: true }, response));
        }));
    }
};
exports.AdminController = AdminController;
exports.AdminController = AdminController = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)()),
    __metadata("design:paramtypes", [AdminUseCase_1.AdminUseCase])
], AdminController);
