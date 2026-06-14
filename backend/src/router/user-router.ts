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

userRouter.post("/login/github", async (req: Request, res: Response) => {
    const code: string = req.body.code;

    if(!code) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Missing github auth code" });
    }

    const service: UserService = new UserService();

    const params = new URLSearchParams({
        client_id: "Ov23liyXKzvf4zPI8g7J",
        client_secret: "8906e4eab88af6346555e946e819d3ce15dd24f5",
        code: code
    });

    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: params
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    //Userinfo holen
    const userRes = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    const userData = await userRes.json();
    
  
    const success: boolean = await service.githubLogin(userData.id, userData.login, userData.name);
  
    if(success) {
        return res.status(StatusCodes.OK).json({ userId: userData.id, message: "GitHub login successful!" });
    } else {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: "GitHub login failed!" });
    }
});

userRouter.post("/register", async (req: Request, res: Response) => {
    const [username, password]: [string, string] = [req.body.username, req.body.password];
    console.log("TEST");
    const service: UserService = new UserService();

    const [success, userId] = await service.registerUser(username, password);

    if(success) {
        res.status(StatusCodes.CREATED).json({ userId, message: "Registering user successful!" });
    } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Registering user failed!" });
    }
});

userRouter.get("/:userId", async (req: Request, res: Response) => {
    const userId: string = req.params.userId;
    const service: UserService = new UserService();

    const user = await service.getUserById(userId);

    if(user) {
        res.status(StatusCodes.OK).json({ 
            userId: user.uuid,
            username: user.username, 
            displayname: user.displayname,
            balance: user.balance
        });
    } else {
        res.status(StatusCodes.NOT_FOUND).json({ message: "User not found!" });
    }
});