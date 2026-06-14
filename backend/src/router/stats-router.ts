import { Router, Request, Response } from "express";
import { statsService } from "../app";
import { StatusCodes } from "http-status-codes";

export const statsRouter = Router()

statsRouter.get(`/leaderboard`, async (req: Request, res: Response) => {
    const leaderBoard = await statsService.getLeaderboard();

    res.status(StatusCodes.OK).json(leaderBoard);
})