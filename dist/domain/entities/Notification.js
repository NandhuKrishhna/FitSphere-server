"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
class Notification {
    constructor(userId, type, message, status = "pending", metadata, read) {
        this.userId = userId;
        this.type = type;
        this.message = message;
        this.status = status;
        this.metadata = metadata;
        this.read = read;
    }
}
exports.Notification = Notification;
