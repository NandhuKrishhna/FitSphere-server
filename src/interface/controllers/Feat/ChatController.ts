import { Inject, Service } from "typedi";
import { ChatUseCase } from "../../../application/user-casers/ChatUseCase";
import catchErrors from "../../../shared/utils/catchErrors";
import { NextFunction, Request, Response } from "express";
import { stringToObjectId } from "../../../shared/utils/bcrypt";
import { CREATED, OK } from "../../../shared/constants/http";
import { Server } from "socket.io";


@Service()
export class ChatController {
    constructor(
        @Inject() private  chatUseCase : ChatUseCase,
        @Inject('io') private  io : Server

    ){}

  //send message
  sendMessageHandler  = catchErrors(async(req:Request, res: Response, next: NextFunction) =>{
      const senderId = stringToObjectId(req.body.senderId);
      const receiverId = stringToObjectId(req.body.receiverId);
      const message = req.body.message;
      const newMessage =  await this.chatUseCase.sendMessage({senderId, receiverId, message});

      this.io.to(senderId.toString()).emit('receiveMessage', newMessage);
      this.io.to(receiverId.toString()).emit('receiveMessage', newMessage);
      
      res.status(CREATED).json({
        success: true,
        message: "Message sent successfully",
        newMessage
      })
  })


  //get messages
  getMessagesHandler = catchErrors(async(req:Request, res: Response, next: NextFunction) =>{
       const senderId = stringToObjectId(req.body.senderId);
       const receiverId = stringToObjectId(req.body.receiverId);
       const message = await this.chatUseCase.getMessages({senderId, receiverId});
       res.status(OK).json({
        success: true,
        messages : "Message Fetch Successfully",
        message
       })
  });


}