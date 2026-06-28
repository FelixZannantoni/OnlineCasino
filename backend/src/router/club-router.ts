    import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { Club } from "../model";
import { clubService } from "../app";

export const clubRouter = Router();

clubRouter.get("/", async (req: Request, res: Response) => {
    const userId = req.query.userId;

    if (!userId) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Bad user id!' });
    }

    const club: Club | null = await clubService.getClubForPlayer(userId.toString());

    return res.status(StatusCodes.OK).json(club);
});

clubRouter.put("/:clubId", async (req: Request, res: Response) => {
    const clubId = Number.parseInt(req.params.clubId.toString());
    const userId = req.body.userId;

    if (!clubId || !userId) {
        return res.status(StatusCodes.BAD_REQUEST).json({ mesage: 'Bad clubId or userId' });
    }

    await clubService.joinClub(userId, clubId);

    return res.status(StatusCodes.OK);
})