import { io } from "../../infrastructure/config/socket.io";

export const emitNotification = (socketId: string | null, message: string) => {
    if (socketId) {
        io.to(socketId).emit("new-notification", { message });
    }
};


export const suspendNotification = (socketId: string | null, message: string) => {
    if (socketId) {
        io.to(socketId).emit("suspend-notification", { message });
    }
};