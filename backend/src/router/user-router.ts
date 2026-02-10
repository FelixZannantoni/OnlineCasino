import express, { Request, Response } from "express";
import { User } from "../model";
import { UserService } from "../services/user-service";
import { StatusCodes } from "http-status-codes";


export const userRouter = express.Router();

userRouter.get("/", (req: Request, res: Response) => {
    const service: UserService = new UserService();
    const users: User[] = service.getAllUsers();

    res.status(StatusCodes.OK).json(users);
});