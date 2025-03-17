import { Server } from "socket.io";
import http from "http";
import express from "express";
import { APP_ORIGIN } from "../../shared/constants/env";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: APP_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSocketMap: { [key: string]: string } = {};
//TODO remove console.log 
export function getReceiverSocketId(userId: any) {
  return userSocketMap[userId] || null;
}
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const userId = socket.handshake.query.userId as string;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle Typing Indicator
  socket.on("typing", ({ senderId, receiverId }) => {
    console.log(senderId , receiverId)
    const receiverSocketId = getReceiverSocketId(receiverId);
    console.log("Receiver Socket Id",receiverSocketId)
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
  socket.on("join-room", (roomId: string, userId: string) => {
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

export { io, app, server };
