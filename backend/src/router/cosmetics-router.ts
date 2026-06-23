import { Router } from "express";
import { cosmeticsService } from "../app";
import { Cosmetic } from "../model";
import { StatusCodes } from "http-status-codes";

export const cosmeticsRouter = Router();

cosmeticsRouter.get("/cosmetics?userId=:userId", async (req, res) => {
    const userId: string = req.params.userId;

    const cosmetics: Cosmetic[] = await cosmeticsService.getCosmeticsByUserId(userId);
    res.status(StatusCodes.OK).json(cosmetics);
});