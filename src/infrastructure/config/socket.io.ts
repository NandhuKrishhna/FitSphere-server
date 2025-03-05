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

export function getReceiverSocketId(userId: any) {
  return userSocketMap[userId] || null;
}
const userSocketMap: { [key: string]: string } = {};

io.on("connection", (socket) => {
  console.log("user connected", socket.id);

  const userId = socket.handshake.query.userId as string;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("join-room", (roomId: string, userId: string) => {
    console.log(`A new user ${userId} joined room ${roomId}`);
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("user-connected", userId);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
