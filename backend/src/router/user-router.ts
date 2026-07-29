import express, { Request, Response } from "express";
import { User, UserDisplay } from "../model";
import { UserService } from "../services/user-service";
import { StatusCodes } from "http-status-codes";
import { userService } from "../app";


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
    
  
    const result = await service.githubLogin(userData.id, userData.login, userData.name);
  
    if(result.success) {
        return res.status(StatusCodes.OK).json({ userId: result.uuid, message: "GitHub login successful!" });
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
    const userId = req.params.userId as string;
    const service: UserService = new UserService();

    const user = await service.getUserById(userId);

    if(user) {
        res.status(StatusCodes.OK).json({ 
            userId: user.uuid,
            username: user.userName, 
            displayname: user.displayName,
            balance: user.balance
        });
    } else {
        res.status(StatusCodes.NOT_FOUND).json({ message: "User not found!" });
    }
});

userRouter.post("/:userId/free-chips", async (req: Request, res: Response) => {
    const userId = req.params.userId as string;
    const service: UserService = new UserService();
    const freeChipAmount = 1000;
    const COOLDOWN_HOURS = 23;

    const user = await service.getUserById(userId);

    if (!user) {
        res.status(StatusCodes.NOT_FOUND).json({ message: "User not found!" });
        return;
    }

    // Check if enough time has passed since last free-chip claim
    if (user.lastFreeChipsClaim) {
        const lastClaimTime = new Date(user.lastFreeChipsClaim).getTime();
        const currentTime = Date.now();
        const cooldownMs = COOLDOWN_HOURS * 60 * 60 * 1000;

        if (currentTime - lastClaimTime < cooldownMs) {
            const timeUntilReset = new Date(lastClaimTime + cooldownMs);
            res.status(StatusCodes.TOO_MANY_REQUESTS).json({
                message: `Free chips available in ${COOLDOWN_HOURS} hours`,
                availableAt: timeUntilReset.toISOString(),
                cooldownHours: COOLDOWN_HOURS
            });
            return;
        }
    }

    const balance = user.balance + freeChipAmount;
    const success = await service.updateUserBalance(userId, balance);
    if (success) {
        await service.updateLastFreeChipsClaim(userId);
        res.status(StatusCodes.OK).json({ balance });
    } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Could not update balance!" });
    }
});

userRouter.get("/:userId/friends", async (req: Request, res: Response) => {
    const userId: string = req.params.userId.toString();

    const service: UserService = new UserService();

    const friends: UserDisplay[] = await userService.getFriendsForUser(userId);

    res.status(StatusCodes.OK).json({ friends });
});

userRouter.post("/friends", async (req: Request, res: Response) => {
    const userId: string = req.body.userId;
    const toUsername: string = req.body.toUsername;

    const service: UserService = new UserService();

    const result = await service.addFriend(userId, toUsername);

    if(result.success) {
        res.status(StatusCodes.CREATED).json({ uuid: result.message });
    } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: result.message });
    }
});

userRouter.put("/friends/accept", async (req: Request, res: Response) => {
    const userId: string = req.body.userId;
    const fromUserId: string = req.body.fromUserId;

    const service: UserService = new UserService();

    const result: boolean = await service.acceptFriendRequest(fromUserId, userId);

    if(result) {
        res.status(StatusCodes.OK).json({ message: 'Friendship request accepted!' });
    } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Friendship request not found!' });
    }
});

userRouter.delete("/friends", async (req: Request, res: Response) => {
    const userId: string = req.body.userId;
    const friendId: string = req.body.friendId;

    const service: UserService = new UserService();

    const result: boolean = await service.removeFriend(userId, friendId);

    if(result) {
        res.status(StatusCodes.NO_CONTENT).json({ message: 'Friend removed!' });
    } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Please try again later!' });
    }
});

userRouter.get("/:userId/friends/pending", async (req: Request, res: Response) => {
    const userId: string = req.params.userId.toString();

    const service: UserService = new UserService();

    const requests = await service.getPendingFriendshipRequests(userId);

    res.status(StatusCodes.OK).json({ requests });
});
