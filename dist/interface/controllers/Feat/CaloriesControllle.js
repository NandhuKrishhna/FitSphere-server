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
exports.CaloriesController = void 0;
const catchErrors_1 = __importDefault(require("../../../shared/utils/catchErrors"));
const typedi_1 = require("typedi");
const CaloriesUserCase_1 = require("../../../application/user-casers/CaloriesUserCase");
const http_1 = require("../../../shared/constants/http");
const user_details_schema_1 = require("../../validations/user.details.schema");
const bcrypt_1 = require("../../../shared/utils/bcrypt");
const appAssert_1 = __importDefault(require("../../../shared/utils/appAssert"));
let CaloriesController = class CaloriesController {
    constructor(_caloriesUseCase) {
        this._caloriesUseCase = _caloriesUseCase;
        this.addUserHealthDetails = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req;
            const data = user_details_schema_1.userDetailsSchema.parse(req.body);
            const response = yield this._caloriesUseCase.addUserHealthDetails(userId, data);
            res.status(http_1.OK).json({
                success: true,
                message: "User Health Details Added Successfully",
                response,
            });
        }));
        this.updateUserDetails = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req;
            const data = user_details_schema_1.updateUserDetailsSchema.parse(req.body);
            const response = yield this._caloriesUseCase.updateUserDetails(userId, data);
            res.status(http_1.OK).json({
                success: true,
                message: "User Details Updated Successfully",
                response,
            });
        }));
        // get user health details
        this.getUserHealthDetailsHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req;
            const userHealthDetails = yield this._caloriesUseCase.getUserHealthDetails(userId);
            res.status(http_1.OK).json({
                success: true,
                message: "User Health Details Fetched Successfully",
                userHealthDetails,
            });
        }));
        // add foodlog
        this.addMealHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req;
            console.log(req.body);
            const { mealType, foodItem, date } = req.body;
            const response = yield this._caloriesUseCase.addMeal(userId, mealType, foodItem, date);
            res.status(http_1.CREATED).json({
                success: true,
                message: "Meal Added Successfully",
                response,
            });
        }));
        this.getFoodLogsHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req;
            const date = req.body.date;
            const response = yield this._caloriesUseCase.getFoodLogs(userId, date);
            res.status(http_1.OK).json({
                success: true,
                message: "Food Logs Fetched Successfully",
                response,
            });
        }));
        //delete food
        this.deleteFoodHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            console.log(req.body);
            const { foodId, date, mealType } = req.body;
            const { userId } = req;
            yield this._caloriesUseCase.deleteFood(userId, foodId, date, mealType);
            res.status(http_1.OK).json({
                success: true,
                message: "Food Deleted Successfully",
            });
        }));
        //* (USDA Food Database) user search food handler
        this.searchFoodHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { query, quantity } = req.query;
            const response = yield this._caloriesUseCase.searchFoodForFoodLog(query, quantity ? Number(quantity) : undefined);
            res.status(http_1.OK).json({
                success: true,
                message: "Food Searched Successfully",
                foodDetails: response,
            });
        }));
        //edit food 
        this.editFoodHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            console.log(req.body);
            const foodId = (0, bcrypt_1.stringToObjectId)(req.body.foodId);
            const { date, mealType, foodItem: updatedFoodItem } = req.body;
            const { userId } = req;
            const response = yield this._caloriesUseCase.editFood(userId, foodId, date, updatedFoodItem, mealType);
            res.status(http_1.OK).json({
                success: true,
                message: "Food Updated Successfully",
                foodId: response
            });
        }));
        //*Get Weight Logs;
        this.getWeightLogHandler = (0, catchErrors_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req;
            (0, appAssert_1.default)(userId, http_1.BAD_REQUEST, "Invalid User ID. Please login again.");
            const weightProgress = yield this._caloriesUseCase.getWeightLogs(userId);
            res.status(http_1.OK).json({
                success: true,
                message: "Weight Log fetch successfully",
                weightProgress
            });
        }));
    }
};
exports.CaloriesController = CaloriesController;
exports.CaloriesController = CaloriesController = __decorate([
    (0, typedi_1.Service)(),
    __param(0, (0, typedi_1.Inject)()),
    __metadata("design:paramtypes", [CaloriesUserCase_1.CaloriesUseCase])
], CaloriesController);
