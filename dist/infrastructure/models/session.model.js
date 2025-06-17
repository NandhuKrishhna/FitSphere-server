"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const date_1 = require("../../shared/utils/date");
const sessionSchema = new mongoose_1.Schema({
    userId: {
        ref: "User",
        type: mongoose_1.Schema.Types.ObjectId,
        index: true,
        required: true,
    },
    role: {
        type: String,
        enum: ["admin", "doctor", "user"],
        required: true,
    },
    userAgent: { type: String },
    createdAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date, default: date_1.thirtyDaysFromNow },
});
const SessionModel = (0, mongoose_1.model)("Session", sessionSchema);
exports.default = SessionModel;
