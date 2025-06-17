"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = exports.io = void 0;
exports.getReceiverSocketId = getReceiverSocketId;
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const env_1 = require("../../shared/constants/env");
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: env_1.APP_ORIGIN,
        methods: ["GET", "POST"],
        credentials: true,
    },
});
exports.io = io;
const userSocketMap = {};
function getReceiverSocketId(userId) {
    return userSocketMap[userId] || null;
}
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    const userId = socket.handshake.query.userId;
    if (userId)
        userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    // Handle Typing Indicator
    socket.on("typing", ({ senderId, receiverId }) => {
        console.log(senderId, receiverId);
        const receiverSocketId = getReceiverSocketId(receiverId);
        console.log("Receiver Socket Id", receiverSocketId);
        if (receiverSocketId) {
            console.log(`User ${senderId} is typing...`);
            io.to(receiverSocketId).emit("typing", { senderId });
        }
    });
    socket.on("stop_typing", ({ senderId, receiverId }) => {
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            console.log(`User ${senderId} stopped typing.`);
            io.to(receiverSocketId).emit("stop_typing", { senderId });
        }
    });
    // Video Call Events
    socket.on("join-room", (roomId, userId) => {
        console.log(`User ${userId} joined room ${roomId}`);
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("user-connected", userId);
    });
    socket.on("user-toggle-audio", (userId, roomId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("user-toggle-audio", userId);
    });
    socket.on("user-toggle-video", (userId, roomId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("user-toggle-video", userId);
    });
    socket.on("user-leave", (userId, roomId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("user-leave", userId);
    });
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});
