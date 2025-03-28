import { Inject, Service } from "typedi";
import { ChatUseCase } from "../../../application/user-casers/ChatUseCase";
import catchErrors from "../../../shared/utils/catchErrors";
import { Request, Response } from "express";
import { stringToObjectId } from "../../../shared/utils/bcrypt";
import { CREATED, NOT_FOUND, OK } from "../../../shared/constants/http";
import { AuthenticatedRequest } from "../../middleware/auth/authMiddleware";
import logger from "../../../shared/utils/logger";
export type GetMessagesQueryParams = {
  receiverId: string;
  page?: string
  limit?: string
}
@Service()
export class ChatController {
  constructor(@Inject() private chatUseCase: ChatUseCase) { }

  //send message
  sendMessageHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId: senderId, role } = req as AuthenticatedRequest;
    const receiverId = stringToObjectId(req.body.receiverId);
    const message = req.body.message;
    const image = req.body.image;
    const newMessage = await this.chatUseCase.sendMessage({
      senderId,
      receiverId,
      message,
      image,
      role
    });

    res.status(CREATED).json({
      success: true,
      message: "Message sent successfully",
      newMessage,
    });
  });

  //get messages
  getMessagesHandler = catchErrors(async (req: Request, res: Response) => {
    const receiverId = stringToObjectId(req.query.receiverId as string);
    const { userId: senderId } = req as AuthenticatedRequest;
    const { messages, conversationId } = await this.chatUseCase.getMessages({
      senderId,
      receiverId,
    });
    res.status(OK).json({
      success: true,
      message: "Message Fetch Successfully",
      messages: messages ? messages : "No messages found",
      conversationId,
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

  createConversationHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId: senderId } = req as AuthenticatedRequest;
    const receiverId = stringToObjectId(req.body.receiverId);
    await this.chatUseCase.createConversation(
      senderId,
      receiverId,
    );
    res.status(CREATED).json({
      success: true,
      message: "Conversation created successfully",

    });
  });

  getConversationHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId: senderId } = req as AuthenticatedRequest;
    const receiverId = stringToObjectId(req.query.receiverId as string);

    const conversation = await this.chatUseCase.getConversation(senderId, receiverId);

    if (conversation) {
      return res.status(OK).json({
        success: true,
        message: "Conversation found successfully",
        conversation,
      });
    }

    return res.status(NOT_FOUND).json({
      success: false,
      message: "No conversation was found",
    });
  });

}
