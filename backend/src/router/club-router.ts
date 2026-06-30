import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { Club, ClubSummary } from "../model";
import { clubService } from "../app";

export const clubRouter = Router();

clubRouter.get("/", async (req: Request, res: Response) => {
    const userId = req.query.userId;

    if (userId) {
        const club: Club | null = await clubService.getClubForPlayer(userId.toString());
        return res.status(StatusCodes.OK).json(club);
    }

    const clubs: ClubSummary[] = await clubService.getAllClubs();
    return res.status(StatusCodes.OK).json(clubs);
});

clubRouter.get("/:clubId", async (req: Request, res: Response) => {
    const clubId = Number.parseInt(req.params.clubId.toString());

    if (!Number.isFinite(clubId)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Bad clubId!' });
    }

    const club: Club | null = await clubService.getClubById(clubId);

    if (!club) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Club not found!' });
    }

    return res.status(StatusCodes.OK).json(club);
});

clubRouter.post("/", async (req: Request, res: Response) => {
    const userId = req.body.userId;
    const name = req.body.name;

    if (!userId || !name) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Bad club name or userId!' });
    }

    const result = await clubService.createClub(userId.toString(), name.toString());

    if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: result.message });
    }

    return res.status(StatusCodes.CREATED).json(result.club);
});

clubRouter.put("/:clubId", async (req: Request, res: Response) => {
    const clubId = Number.parseInt(req.params.clubId.toString());
    const userId = req.body.userId;

    if (!Number.isFinite(clubId) || !userId) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Bad clubId or userId' });
    }

    const success = await clubService.joinClub(userId.toString(), clubId);

    if (!success) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Club or user not found!' });
    }

    const club: Club | null = await clubService.getClubById(clubId);

    return res.status(StatusCodes.OK).json(club);
});

clubRouter.delete("/membership", async (req: Request, res: Response) => {
    const userId = req.body.userId;

    if (!userId) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Bad userId!' });
    }

    const success = await clubService.leaveClub(userId.toString());

    if (!success) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found!' });
    }

    return res.status(StatusCodes.NO_CONTENT).send();
});
