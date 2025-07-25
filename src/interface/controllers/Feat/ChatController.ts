import { Inject, Service } from "typedi";
import { ChatUseCase } from "../../../application/user-cases/ChatUseCase";
import catchErrors from "../../../shared/utils/catchErrors";
import { Request, Response } from "express";
import { stringToObjectId } from "../../../shared/utils/bcrypt";
import { CREATED, NOT_FOUND, OK } from "../../../shared/constants/http";
import { AuthenticatedRequest } from "../../middleware/auth/authMiddleware";
import { IChatUseCaseToken } from "../../../application/user-cases/interface/IChatUseCase";
import { IChatController, IChatControllerToken } from "../../controllerInterface/IChatController";
export type GetMessagesQueryParams = {
  receiverId: string;
  page?: string
  limit?: string
}
@Service()
export class ChatController implements IChatController {
  constructor(@Inject() private _chatUseCase: ChatUseCase) { }

  //send message
  sendMessageHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId: senderId, role } = req as AuthenticatedRequest;
    const receiverId = stringToObjectId(req.body.receiverId);
    const message = req.body.message;
    const image = req.body.image;
    const newMessage = await this._chatUseCase.sendMessage({
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
    const { messages, conversationId } = await this._chatUseCase.getMessages({
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
    const users = await this._chatUseCase.getAllUsers(userId, role);
    res.status(OK).json({
      success: true,
      message: "Users fetched successfully",
      users,
    });
  });

  createConversationHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId: senderId } = req as AuthenticatedRequest;
    const receiverId = stringToObjectId(req.body.receiverId);
    const response = await this._chatUseCase.createConversation(
      senderId,
      receiverId,
    );
    res.status(CREATED).json({
      success: true,
      message: "Conversation created successfully",
      response

    });
  });

  getConversationHandler = catchErrors(async (req: Request, res: Response) => {
    const { userId: senderId } = req as AuthenticatedRequest;
    const receiverId = stringToObjectId(req.query.receiverId as string);

    const conversation = await this._chatUseCase.getConversation(senderId, receiverId);

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
