import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { rouletteService } from "../app";
import { RouletteService } from "../services/roulette-service";

export const rouletteRouter = Router();

rouletteRouter.post("/addPlayer", async (req: Request, res: Response) => {
    const { playerId, username, displayname, balance, gameId } = req.body;
    if (!playerId || !username || !displayname || balance === undefined || !gameId) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing required fields in request body" });
        return;
    }
    const result = await rouletteService.addPlayer(playerId, username, displayname, balance, gameId);

    if (result.success) {
        res.status(StatusCodes.OK).json({ message: "Added Player to roulette game" });
    } else {
        res.status(StatusCodes.NOT_FOUND).json({ message: result.message });
    }
});

rouletteRouter.put("/bet", async (req: Request, res: Response) => {
    const { playerId, gameId, amount, field } = req.body;
    if (!playerId || !gameId || amount === undefined || !field) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing required fields in request body" });
        return;
    }

    const result = await rouletteService.bet(playerId, gameId, amount, field);

    if (result.success) {
        res.status(StatusCodes.OK).json({ message: "Bet placed" });
    } else {
        res.status(StatusCodes.BAD_REQUEST).json({ message: result.message });
    }
});

rouletteRouter.put("/ready", async (req: Request, res: Response) => {
    const { playerId, gameId } = req.body;
    if (!playerId || !gameId) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing required fields" });
        return;
    }

    const result = await rouletteService.ready(playerId, gameId);

    if (result.success) {
        res.status(StatusCodes.OK).json({ message: "Ready status updated" });
    } else {
        res.status(StatusCodes.BAD_REQUEST).json({ message: result.message });
    }
});

rouletteRouter.get("/gameState/:gameId", async (req: Request, res: Response) => {
    const gameId = req.params.gameId;
    const { game } = rouletteService.getGameById(gameId as string);

    if (game) {
        res.status(StatusCodes.OK).json(game.getGameState());
    } else {
        res.status(StatusCodes.NOT_FOUND).json({ message: `Game with id ${gameId} not found` });
    }
});

rouletteRouter.get("/games", async (req: Request, res: Response) => {
    const games = RouletteService.rouletteGames.map(game => game.getGameState());
    res.status(StatusCodes.OK).json(games);
});