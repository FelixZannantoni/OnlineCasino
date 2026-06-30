import { Request, Response, Router } from "express";
import { cosmeticsService } from "../app";
import { Cosmetic } from "../model";
import { StatusCodes } from "http-status-codes";

export const cosmeticsRouter = Router();

cosmeticsRouter.get("/", async (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    const includeUnowned = req.query.includeUnowned === "true";

    if (!userId) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: "Missing userId!" });
        return;
    }

    const cosmetics: Cosmetic[] = includeUnowned
        ? await cosmeticsService.getAllCosmeticsForUser(userId)
        : await cosmeticsService.getCosmeticsByUserId(userId);
    res.status(StatusCodes.OK).json(cosmetics);
});

cosmeticsRouter.post("/", async (req: Request, res: Response) => {
    const userId = req.body.userId;
    const cosmeticId = Number(req.body.cosmeticId);
    const cosmeticType = req.body.cosmeticType as Cosmetic["type"];

    const success = await cosmeticsService.addCosmeticToUser(userId, cosmeticId, cosmeticType);

    if (success) {
        res.status(StatusCodes.CREATED).json({ message: "Cosmetic saved!" });
    } else {
        res.status(StatusCodes.BAD_REQUEST).json({ message: "Could not save cosmetic!" });
    }
});

cosmeticsRouter.put("/equip", async (req: Request, res: Response) => {
    const userId = req.body.userId;
    const cosmeticId = Number(req.body.cosmeticId);
    const cosmeticType = req.body.cosmeticType as Cosmetic["type"];

    const success = await cosmeticsService.equipCosmetic(userId, cosmeticId, cosmeticType);

    if (success) {
        res.status(StatusCodes.OK).json({ message: "Cosmetic equipped!" });
    } else {
        res.status(StatusCodes.BAD_REQUEST).json({ message: "Could not equip cosmetic!" });
    }
});
