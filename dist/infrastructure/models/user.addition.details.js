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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDetailsModel = void 0;
const mongoose_1 = require("mongoose");
const weightLog_model_1 = require("./weightLog.model");
const calorieCalculator_1 = require("../../shared/utils/calorieCalculator");
const userSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    age: Number,
    gender: String,
    height: Number,
    weight: Number,
    activityLevel: String,
    goal: String,
    targetWeight: Number,
    weeksToGoal: Number,
    targetDailyCalories: Number,
}, { timestamps: true });
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isNew || this.isModified("weight") || this.isModified("targetWeight") || this.isModified("activityLevel") || this.isModified("goal") || this.isModified("weeksToGoal")) {
            this.targetDailyCalories = (0, calorieCalculator_1.calculateTargetCalories)(this);
        }
        if (this.isNew) {
            const existingWeightLog = yield weightLog_model_1.WeightLogModel.findOne({ userId: this.userId });
            if (!existingWeightLog) {
                yield weightLog_model_1.WeightLogModel.create({
                    userId: this.userId,
                    date: new Date(),
                    weight: this.weight,
                });
            }
        }
        next();
    });
});
exports.UserDetailsModel = (0, mongoose_1.model)("UserDetails", userSchema);
