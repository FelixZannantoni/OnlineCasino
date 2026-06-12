import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { StatusCodes } from "http-status-codes";
import "dotenv/config";
import { DB } from "./data";
import { userRouter } from "./router/user-router";
import { pokerRouter } from "./router/poker-router";
import { blackjackRouter } from "./router/blackjack-router";
import { PokerService } from "./services/poker-service";
import { slotmachineRouter } from "./router/slotmachine-router";
import { Poker } from "./gameLogic/poker";
import { UserService } from "./services/user-service";
import { BlackjackService } from "./services/blackjack-service";
import { ChatService } from "./services/chat-service";
import { chatRouter } from "./router/chat-router";
import { normalizeUserId } from "./utils";

const PORT = process.env.PORT || 3000;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Adjust this in production
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());
app.use("/users", userRouter);
app.use("/poker", pokerRouter);
app.use("/blackjack", blackjackRouter);
app.use("/slotmachine", slotmachineRouter);
app.use("/chats", chatRouter);


const socketUserMap: Map<string, string> = new Map();

const onlineUsers: Map<string, string> = new Map(); // <userId, status>

const pokerService: PokerService = new PokerService();
const blackjackService: BlackjackService = new BlackjackService();
const userService: UserService = new UserService();
const chatService: ChatService = new ChatService();
export { pokerService, blackjackService, userService, chatService, onlineUsers };

export function onMessageSentToUser(receiverId: string) {
    // Find the socket ID for the receiver
    // socket id map is Map<socketId, userId>, so we need to find the socketId for the receiverId
    console.log(`Attempting to notify user ${receiverId} of new message`);
    const receiverSocketId = socketUserMap.entries().find(([socketId, userId]) => userId === receiverId)?.[0];

    if (receiverSocketId) {
        io.to(receiverSocketId).emit("new_message");
        console.log(`Notified user ${receiverId} of new message via socket ${receiverSocketId}`);
    }
}

// Socket.io connection handling
io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('register', (userId: string | number) => {
        socketUserMap.set(socket.id, normalizeUserId(userId));
        onlineUsers.set(normalizeUserId(userId), "online");
    })

    socket.on("join_game", async (gameId: string, userId: string) => {
        console.log("join_game received:", gameId, userId);
        socketUserMap.set(socket.id, normalizeUserId(userId));

        socket.join(gameId);
        console.log(`User ${userId} joined game: ${gameId}`);

        const userService = new UserService();
        const user = await userService.getUserById(userId);
        const startBalance: number = 1000;

        let game: any = PokerService.pokerGames.find(
            (g) => g.getGameId().toString() === gameId.toString()
        );
        let service: any = pokerService;

        if (!game) {
            game = BlackjackService.blackjackGames.find(
                (g) => g.getGameId().toString() === gameId.toString()
            );
            service = blackjackService;
        }

        if (!game) {
            socket.emit("error", { message: `Game ${gameId} not found` });
            return;
        }

        const alreadyIn = game.getGameState().players.some((p: any) => p.id === userId);
        if (!alreadyIn) {
            if (service === pokerService) {
                await pokerService.addPlayer(
                    userId,
                    user?.userName ?? '-',
                    user?.displayName ?? 'Guest',
                    user?.balance ?? startBalance,
                    false,
                    0,
                    gameId
                );
                onlineUsers.set(normalizeUserId(userId), "Playing Poker");
            } else {
                await blackjackService.addPlayer(
                    userId,
                    user?.userName ?? '-',
                    user?.displayName ?? 'Guest',
                    user?.balance ?? startBalance,
                    gameId
                );
                onlineUsers.set(normalizeUserId(userId), "Playing Blackjack");
            }
        }

        if (game.listenerCount("gameState") === 0) {
            game.on("gameState", (state: any) => {
                io.to(gameId).emit("game_state", state);
            });
        }

        const playerCount = game.getGameState().players.length;
        // Start game based on type
        if (service === pokerService && playerCount >= 2 && playerCount <= 5) {
            game.startGame();
        } else if (service === blackjackService && playerCount >= 1) {
            game.startGame();
        }
        socket.emit("game_state", game.getGameState());
    });

    socket.on("player_move", async (data: { gameId: string; action: string; amount?: number }) => {
        const { gameId, action, amount } = data;
        const playerId = socketUserMap.get(socket.id);

        if (!playerId) {
            console.warn(`Unknown socket tried making a move: ${socket.id}`);
            return;
        }

        console.log(`Player ${playerId} performed action: ${action} in game: ${gameId} with amount: ${amount}`);

        let actionResult = { success: false, message: "Invalid action" };

        switch (action) {
            case "fold":
                actionResult = await pokerService.fold(playerId, gameId);
                break;
            case "check":
                actionResult = await pokerService.check(playerId, gameId);
                break;
            case "call":
                actionResult = await pokerService.call(playerId, gameId);
                break;
            case "bet":
                if (amount !== undefined) {
                    // Try poker first, then blackjack
                    actionResult = await pokerService.bet(playerId, gameId, amount);
                    if (!actionResult.success) {
                        actionResult = await blackjackService.bet(playerId, gameId, amount);
                    }
                }
                break;
            case "raise":
                if (amount !== undefined)
                    actionResult = await pokerService.raise(playerId, gameId, amount);
                break;
            case "hit":
                actionResult = await blackjackService.hit(playerId, gameId);
                break;
            case "stand":
                actionResult = await blackjackService.stand(playerId, gameId);
                break;
            case "double":
                actionResult = await blackjackService.double(playerId, gameId);
                break;
        }

        if (!actionResult.success) {
            console.warn(`Action failed for player ${playerId} in game ${gameId}: ${actionResult.message}`);
        }
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        const userId = socketUserMap.get(socket.id);
        if (userId) {
            onlineUsers.delete(userId);
        }

        socketUserMap.delete(socket.id);
    });
});

httpServer.listen(PORT, () => console.log(`Server running on: http://localhost:${PORT}`));

DB.createDBConnection();
pokerService.loadAllPokerGames();
blackjackService.loadAllBlackjackGames();