import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { PokerService } from "../services/poker-service";

export const pokerRouter = Router();

// route for adding a player to a game
pokerRouter.post("/addPlayer", async (req: Request, res: Response) => {
    const { playerId, username, displayname, balance, hasDealerChip, bet, gameId } = req.body;
    if (!playerId || !username || !displayname || balance === undefined || hasDealerChip === undefined || bet === undefined || !gameId) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing required fields in request body" });
        return;
    }

    const service: PokerService = new PokerService();
    await service.addPlayer(playerId, username, displayname, balance, hasDealerChip, bet, gameId);
});

// route for pressing fold
pokerRouter.put("/fold", async (req: Request, res: Response) => {
    const [playerId, gameId]: [string, string] = [req.body.playerId, req.body.gameId];
    if (!playerId || !gameId) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing playerId or gameId in request body" });
        return;
    }

    const service: PokerService = new PokerService();

    await service.fold(playerId, gameId);

    res.status(StatusCodes.OK).json({ message: "Fold action received" });
});