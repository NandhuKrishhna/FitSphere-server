import { Inject, Service } from "typedi";
import { ChatUseCase } from "../../../application/user-casers/ChatUseCase";
import catchErrors from "../../../shared/utils/catchErrors";
import { NextFunction, Request, Response } from "express";
import { stringToObjectId } from "../../../shared/utils/bcrypt";
import { CREATED, OK } from "../../../shared/constants/http";
import { AuthenticatedRequest } from "../../middleware/auth/authMiddleware";

@Service()
export class ChatController {
  constructor(@Inject() private chatUseCase: ChatUseCase) {}

  //send message
  sendMessageHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId: senderId } = req as AuthenticatedRequest;
    const receiverId = stringToObjectId(req.body.receiverId);
    console.log("ReceiverId from sendMessage Handler", receiverId);
    const message = req.body.message;
    const newMessage = await this.chatUseCase.sendMessage({
      senderId,
      receiverId,
      message,
    });

    res.status(CREATED).json({
      success: true,
      message: "Message sent successfully",
      newMessage,
    });
  });

  //get messages
  getMessagesHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId: senderId } = req as AuthenticatedRequest;
    const receiverId = stringToObjectId(req.body.receiverId);
    const messages = await this.chatUseCase.getMessages({
      senderId,
      receiverId,
    });
    res.status(OK).json({
      success: true,
      message: "Message Fetch Successfully",
      messages,
    });
  });

  getAllUsersHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const { role } = req as AuthenticatedRequest;
    const users = await this.chatUseCase.getAllUsers(userId, role);
    res.status(OK).json({
      success: true,
      message: "Users fetched successfully",
      users,
    });
  });
}
