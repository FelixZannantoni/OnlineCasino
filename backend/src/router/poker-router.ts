import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { PokerService } from "../services/poker-service";
import { Poker } from "../gameLogic/poker";

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

    res.status(StatusCodes.OK).json({ message: "Added Player to pokergame" });
});

// route for pressing fold
pokerRouter.put("/fold", async (req: Request, res: Response) => {
    const [playerId, gameId]: [string, string] = [req.body.playerId, req.body.gameId];
    if (!playerId || !gameId) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing playerId or gameId in request body" });
        return;
    }

    const service: PokerService = new PokerService();

    const result = await service.fold(playerId, gameId);

    if(result) {
        res.status(StatusCodes.OK).json({ message: "Fold action received" });
    } else {
        res.status(StatusCodes.NOT_FOUND).json({ message: "Invalid game-ID or player-ID" });
    } 
});

pokerRouter.put("/check", async (req: Request, res: Response) => {
    const [playerId, gameId]: [string, string] = [req.body.playerId, req.body.gameId];
    if(!playerId || !gameId) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing playerId or gameId in request body" });
        return;
    }

    const service: PokerService = new PokerService();

    const result = await service.check(playerId, gameId);

    if(result) {
        res.status(StatusCodes.OK).json({ message: "Check action received" });
    } else {
        res.status(StatusCodes.NOT_FOUND).json({ message: "Invalid game-ID or player-ID" });
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

    const service: PokerService = new PokerService();

    const result = await service.bet(playerId, gameId, betAmount);

    if(result) {
        res.status(StatusCodes.OK).json({ message: "Bet received" });
    } else {
        res.status(StatusCodes.NOT_FOUND).json({ message: `Something happened while tryign to bet ${betAmount}` });
    }
pokerRouter.get("/games", async (req: Request, res: Response) => {
    const games: Poker[] = [...PokerService.pokerGames];

    res.status(StatusCodes.OK).json({ games });
})