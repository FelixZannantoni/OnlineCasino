import { Router, Request, Response } from "express";
import { statsService } from "../app";
import { StatusCodes } from "http-status-codes";

export const statsRouter = Router()

statsRouter.get(`/leaderboard`, async (req: Request, res: Response) => {
    const leaderBoard = await statsService.getLeaderboard();

    res.status(StatusCodes.OK).json(leaderBoard);
});

statsRouter.post(`/games/:gameId/favourite`, async (req: Request, res: Response) => {
    const gameId: number = Number.parseInt(req.params.gameId.toString());
    const userId: string = (req.query.userId ?? '').toString();

    if (!gameId || !userId) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Bad gameId or bad userId!' });
    }

    await statsService.favouriteGame(userId, gameId);

    return res.status(StatusCodes.OK);
});

statsRouter.delete(`/games/:gameId/favourite`, async (req: Request, res: Response) => {
    const gameId: number = Number.parseInt(req.params.gameId.toString());
    const userId: string = (req.query.userId ?? '').toString();

    if (!gameId || !userId) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Bad gameId or bad userId!' });
    }

    await statsService.unFavouriteGame(userId, gameId);

    return res.status(StatusCodes.NO_CONTENT);
});

statsRouter.get("/games/favourite", async (req: Request, res: Response) => {
    const userId: string = (req.query.userId ?? '').toString();
    const gameIds = await statsService.getFavouriteGames(userId);

    return res.status(StatusCodes.OK).json({ gameIds });
});