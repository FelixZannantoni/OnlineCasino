import { Request, Response, Router } from "express";
import { UserService } from "../services/user-service";
import { StatusCodes } from "http-status-codes";

export const loginRouter = Router();

loginRouter.post("/", async (req: Request, res: Response) => {
    const [username, password]: [string, string] = [req.body.username, req.body.password];

    const service: UserService = new UserService();

    const [success, userId] = await service.checkUserCredentials(username, password);

    if(success) {
        res.status(StatusCodes.OK).json({ userId, mesage: "LogIn successful!" });
    } else {
        res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid credentials!" });
    }
});