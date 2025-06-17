"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Otp = void 0;
class Otp {
    constructor(_id, userId, code, type, expiresAt, createdAt) {
        this._id = _id;
        this.userId = userId;
        this.code = code;
        this.type = type;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
    }
}
exports.Otp = Otp;
