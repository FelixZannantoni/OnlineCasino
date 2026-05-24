import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { SlotmachineService } from "../services/slotmachine-service";

export const slotmachineRouter = Router();
const service = new SlotmachineService();

slotmachineRouter.post("/create", async (req: Request, res: Response) => {
    const { playerId, username, displayname, balance } = req.body;
    if (!playerId || !username || !displayname || balance === undefined) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing required fields" });
        return;
    }

    const gameId = await service.createGame(playerId, username, displayname, balance);
    res.status(StatusCodes.OK).json({ gameId });
});

slotmachineRouter.post("/spin", async (req: Request, res: Response) => {
    const { gameId, bet } = req.body;
    if (!gameId || bet === undefined) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing gameId or bet" });
        return;
    }

    const result = await service.spin(gameId, bet);
    if (result) {
        res.status(StatusCodes.OK).json(result);
    } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Spin failed" });
    }
});
