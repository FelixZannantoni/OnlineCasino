import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { ClubChatMessage } from "../model";
import { clubChatService } from "../app";

export const clubChatRouter = Router();

clubChatRouter.get("/:clubId", async (req: Request, res: Response) => {
    const clubId = Number.parseInt(req.params.clubId.toString());

    if (!Number.isFinite(clubId)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Bad clubId!' });
    }

    const messages: ClubChatMessage[] = await clubChatService.getClubChatMessages(clubId);

    return res.status(StatusCodes.OK).json({ messages });
});

clubChatRouter.post("/:clubId", async (req: Request, res: Response) => {
    const clubId = Number.parseInt(req.params.clubId.toString());
    const senderId = req.body.senderId;
    const senderName = req.body.senderName;
    const content = req.body.content;

    if (!Number.isFinite(clubId) || !senderId || !senderName || !content) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Bad request parameters!' });
    }

    const success = await clubChatService.sendMessage(clubId, senderId, senderName, content);

    if (success) {
        return res.status(StatusCodes.CREATED).json({ message: 'Message sent!' });
    } else {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Something happened, try again later!' });
    }
});