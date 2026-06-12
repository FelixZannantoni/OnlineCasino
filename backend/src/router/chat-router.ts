import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { ChatMessage } from "../model";
import { chatService, onMessageSentToUser } from "../app";

export const chatRouter = Router();

chatRouter.get("/", async (req: Request, res: Response) => {
    if (!req.query.userId) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'UserId is required!' });
    }
    
    const userId: string = req.query.userId as string;

    const messages: ChatMessage[] = await chatService.getChatMessagesForUser(userId);

    return res.status(StatusCodes.OK).json({ messages });
});

chatRouter.post("/", async (req: Request, res: Response) => {
    const [userId, receiverId, content]: [string, string, string] = [req.body.userId, req.body.receiverId, req.body.content];

    if (!userId || !receiverId) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'UserId and ReceiverId are required!' });
    }

    const result = await chatService.sendMessage(userId, receiverId, content);

    if (result) {
        return res.status(StatusCodes.CREATED).json({ message: 'Message sent!' });
    } else {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Something happened, try again later!' });
    }
});