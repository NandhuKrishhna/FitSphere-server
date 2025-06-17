"use strict";
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
exports.setupCalorieIntakeCron = void 0;
const caloriesIntakeModel_1 = require("../../infrastructure/models/caloriesIntakeModel");
const user_addition_details_1 = require("../../infrastructure/models/user.addition.details");
const node_cron_1 = __importDefault(require("node-cron"));
const setupCalorieIntakeCron = () => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const existingLogs = yield caloriesIntakeModel_1.CalorieIntakeModel.findOne({ date: today });
    if (!existingLogs) {
        yield createCalorieLogs(today);
    }
    else {
    }
    node_cron_1.default.schedule("0 0 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
        yield createCalorieLogs(new Date());
    }));
});
exports.setupCalorieIntakeCron = setupCalorieIntakeCron;
const createCalorieLogs = (date) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_addition_details_1.UserDetailsModel.find().select("userId targetDailyCalories");
        if (users.length === 0) {
            return;
        }
        date.setUTCHours(0, 0, 0, 0);
        const bulkOps = users.map((user) => ({
            updateOne: {
                filter: { userId: user.userId, date },
                update: {
                    $setOnInsert: {
                        userId: user.userId,
                        date,
                        requiredCalories: user.targetDailyCalories,
                        totalCalories: 0,
                        totalProtien: 0,
                        totalCarbs: 0,
                        totalFats: 0,
                        meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
                    },
                },
                upsert: true,
            },
        }));
        if (bulkOps.length > 0) {
            const result = yield caloriesIntakeModel_1.CalorieIntakeModel.bulkWrite(bulkOps);
        }
        else {
        }
    }
    catch (error) {
    }
});
