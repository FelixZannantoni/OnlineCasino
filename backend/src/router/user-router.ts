import express, { Request, Response } from "express";
import { User } from "../model";
import { UserService } from "../services/user-service";
import { StatusCodes } from "http-status-codes";


export const userRouter = express.Router();

userRouter.get("/", async (req: Request, res: Response) => {
    const service: UserService = new UserService();
    const users: User[] = await service.getAllUsers();

    res.status(StatusCodes.OK).json(users);
});

userRouter.post("/login", async (req: Request, res: Response) => {
    const [username, password]: [string, string] = [req.body.username, req.body.password];

    const service: UserService = new UserService();

    const [success, userId] = await service.checkUserCredentials(username, password);

    if(success) {
        res.status(StatusCodes.OK).json({ userId, mesage: "LogIn successful!" });
    } else {
        res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid credentials!" });
    }
});

userRouter.post("/register", async (req: Request, res: Response) => {
    const [username, password]: [string, string] = [req.body.username, req.body.password];

    const service: UserService = new UserService();

    const [success, userId] = await service.registerUser(username, password);

    if(success) {
        res.status(StatusCodes.CREATED).json({ userId, message: "Registering user successful!" });
    } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Registering user failed!" });
    }
});