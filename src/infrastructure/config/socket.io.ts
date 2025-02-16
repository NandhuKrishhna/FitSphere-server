import {Server} from "socket.io";
import http from "http";
import express from "express";
import { APP_ORIGIN } from "../../shared/constants/env";
import Container from "typedi";


const app = express();
const server = http.createServer(app);

const io = new Server(server , {
    cors :{
        origin : APP_ORIGIN,
        methods : ["GET" , "POST"],
        credentials : true
    }
});

Container.set('io', io)

io .on("connection" , (socket) => {
    console.log("user connected", socket.id);

    socket.on('join', (userId: string) =>{
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
    });


    socket.on("disconnect" , () => {
        console.log("user disconnected", socket.id);
    });
});


export {io , app , server};