import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { PokerService } from "../services/poker-service";
import { Poker } from "../gameLogic/poker";
import { pokerService } from "../app";

export const pokerRouter = Router();

// route for adding a player to a game
pokerRouter.post("/addPlayer", async (req: Request, res: Response) => {
    const { playerId, username, displayname, balance, hasDealerChip, bet, gameId } = req.body;
    if (!playerId || !username || !displayname || balance === undefined || hasDealerChip === undefined || bet === undefined || !gameId) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing required fields in request body" });
        return;
    }
    const result = await pokerService.addPlayer(playerId, username, displayname, balance, hasDealerChip, bet, gameId);

    res.status(StatusCodes.OK).json({ message: "Added Player to pokergame" });
});

// route for pressing fold
pokerRouter.put("/fold", async (req: Request, res: Response) => {
    const [playerId, gameId]: [string, string] = [req.body.playerId, req.body.gameId];
    if (!playerId || !gameId) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing playerId or gameId in request body" });
        return;
    }

    const result = await pokerService.fold(playerId, gameId);

    if(result.success) {
        res.status(StatusCodes.OK).json({ message: "Fold action received" });
    } else {
        res.status(StatusCodes.NOT_FOUND).json({ message: result.message });
    } 
});

pokerRouter.put("/check", async (req: Request, res: Response) => {
    const [playerId, gameId]: [string, string] = [req.body.playerId, req.body.gameId];
    if(!playerId || !gameId) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing playerId or gameId in request body" });
        return;
    }

    const result = await pokerService.check(playerId, gameId);

    if(result.success) {
        res.status(StatusCodes.OK).json({ message: "Check action received" });
    } else {
        res.status(StatusCodes.NOT_FOUND).json({ message: result.message });
    }
});

pokerRouter.put("/bet", async (req: Request, res: Response) => {
    const [playerId, gameId, betAmount]: [string, string, number] = [req.body.playerId, req.body.gameId, req.body.betAmount];
    if(!playerId || !gameId) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing playerId or gameId in request body" });
        return;
    }
    if(!betAmount || isNaN(betAmount)) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid bet amount" });
        return;
    }

    const result = await pokerService.bet(playerId, gameId, betAmount);

    if(result.success) {
        res.status(StatusCodes.OK).json({ message: "Bet received" });
    } else {
        res.status(StatusCodes.NOT_FOUND).json({ message: result.message });
    }
});

pokerRouter.put("/call", async (req: Request, res: Response) => {
    const [playerId, gameId]: [string, string] = [req.body.playerId, req.body.gameId];
    if(!playerId || !gameId) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: "Missing playerId or gameId in request body" });
        return;
    }

    const result = pokerService.call(playerId, gameId);

    if(result.success) {
        res.status(StatusCodes.OK).json({ message: result.message });
    } else {
        res.status(StatusCodes.NOT_FOUND).json({ message: result.message });
    }
});

pokerRouter.put("/raise", async (req: Request, res: Response) => {
    const [playerId, gameId, amount]: [string, string, number] = [req.body.playerId, req.body.gameId, req.body.amount];
    if(!playerId || !gameId) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: "Missing playerId or gameId in request body" });
        return;
    }

    const result = pokerService.raise(playerId, gameId, amount);

    if(result.success) {
        res.status(StatusCodes.OK).json({ message: result.message });
    } else {
        res.status(StatusCodes.NOT_FOUND).json({ message: result.message });
    }
});