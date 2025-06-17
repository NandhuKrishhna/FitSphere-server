"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suspendNotification = exports.emitNotification = void 0;
const socket_io_1 = require("../../infrastructure/config/socket.io");
const emitNotification = (socketId, message) => {
    if (socketId) {
        socket_io_1.io.to(socketId).emit("new-notification", { message });
    }
};
exports.emitNotification = emitNotification;
const suspendNotification = (socketId, message) => {
    if (socketId) {
        socket_io_1.io.to(socketId).emit("suspend-notification", { message });
    }
};
exports.suspendNotification = suspendNotification;
