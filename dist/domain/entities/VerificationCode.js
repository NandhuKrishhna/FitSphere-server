"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationCode = void 0;
class VerificationCode {
    constructor(userId, type, expiresAt, createdAt, _id) {
        this.userId = userId;
        this.type = type;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
        this._id = _id;
    }
}
exports.VerificationCode = VerificationCode;
