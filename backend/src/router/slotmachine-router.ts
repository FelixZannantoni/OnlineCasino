import { Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { SlotmachineService } from "../services/slotmachine-service";
import { userService } from "../app";

export const slotmachineRouter = Router();
const service = new SlotmachineService();

slotmachineRouter.post("/create", async (req: Request, res: Response) => {
    const { playerId, username, displayname } = req.body;
    if (!playerId || !username || !displayname) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Missing required fields" });
        return;
    }

    try {
        // Load balance from database instead of accepting it from frontend
        const user = await userService.getUserById(playerId);
        if (!user) {
            res.status(StatusCodes.NOT_FOUND).json({ error: "User not found" });
            return;
        }
        
        const balance = user.balance;
        const gameId = await service.createGame(playerId, username, displayname, balance);
        res.status(StatusCodes.OK).json({ gameId, balance });
    } catch (e) {
        console.error("Failed to create slotmachine game:", e);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to create game" });
    }
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
