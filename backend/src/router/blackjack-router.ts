import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { blackjackService } from "../app";

export const blackjackRouter = Router();

// route for adding a player to a game
blackjackRouter.post("/addPlayer", async (req: Request, res: Response) => {
    const { playerId, username, displayname, balance, gameId } = req.body;
    if (!playerId || !username || !displayname || balance === undefined || !gameId) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing required fields in request body" });
        return;
    }
    const result = await blackjackService.addPlayer(playerId, username, displayname, balance, gameId);

    if (result.success) {
        res.status(StatusCodes.OK).json({ message: "Added Player to blackjack game" });
    } else {
        res.status(StatusCodes.NOT_FOUND).json({ message: result.message });
    }
});

blackjackRouter.put("/hit", async (req: Request, res: Response) => {
    const { playerId, gameId } = req.body;
    if (!playerId || !gameId) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing playerId or gameId in request body" });
        return;
    }

    const result = await blackjackService.hit(playerId, gameId);

    if(result.success) {
        res.status(StatusCodes.OK).json({ message: "Hit action received" });
    } else {
        res.status(StatusCodes.NOT_FOUND).json({ message: result.message });
    } 
});

blackjackRouter.put("/stand", async (req: Request, res: Response) => {
    const { playerId, gameId } = req.body;
    if (!playerId || !gameId) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing playerId or gameId in request body" });
        return;
    }

    const result = await blackjackService.stand(playerId, gameId);

    if(result.success) {
        res.status(StatusCodes.OK).json({ message: "Stand action received" });
    } else {
        res.status(StatusCodes.NOT_FOUND).json({ message: result.message });
    }
});

blackjackRouter.put("/double", async (req: Request, res: Response) => {
    const { playerId, gameId } = req.body;
    if (!playerId || !gameId) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing playerId or gameId in request body" });
        return;
    }

    const result = await blackjackService.double(playerId, gameId);

    if(result.success) {
        res.status(StatusCodes.OK).json({ message: "Double action received" });
    } else {
        res.status(StatusCodes.NOT_FOUND).json({ message: result.message });
    }
});