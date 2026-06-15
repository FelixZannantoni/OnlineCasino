import path from "path";
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
import { rouletteRouter } from "./router/roulette-router";
import { PokerService } from "./services/poker-service";
import { slotmachineRouter } from "./router/slotmachine-router";
import { Poker } from "./gameLogic/poker";
import { UserService } from "./services/user-service";
import { BlackjackService } from "./services/blackjack-service";
import { RouletteService } from "./services/roulette-service";
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
app.use("/roulette", rouletteRouter);
app.use("/slotmachine", slotmachineRouter);
app.use("/chats", chatRouter);

// Redirect root to login page
app.get("/", (req, res) => {
    res.redirect("/login");
})

// Serve Frontend Static Files
const publicPath = path.resolve(__dirname, "../public");
console.log(`Serving static files from: ${publicPath}`);

// 1. Serve static files (js, css, icons)
app.use(express.static(publicPath, {
    maxAge: '1y',
    fallthrough: true // If file not found, continue to the catch-all
}));

// 2. Catch-all for Angular Routing
// Using a RegExp object directly bypasses path-to-regexp string parsing
app.get(/^(?!\/(users|poker|blackjack|roulette|slotmachine)).*/, (req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
});

// For the specific game routes, also serve index.html
app.get(["/poker", "/blackjack", "/roulette", "/slotmachine"], (req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
});


const socketUserMap: Map<string, string> = new Map();

const onlineUsers: Map<string, string> = new Map(); // <userId, status>

const pokerService: PokerService = new PokerService();
const blackjackService: BlackjackService = new BlackjackService();
const rouletteService: RouletteService = new RouletteService();
const userService: UserService = new UserService();

const chatService: ChatService = new ChatService();
export { pokerService, blackjackService, rouletteService, userService, chatService, onlineUsers };

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

        const user = await userService.getUserById(userId);
        const startBalance: number = 1000;

        let game: any = PokerService.pokerGames.find(
            (g) => g.getGameId().toString() === gameId.toString()
        );
        let service: any = pokerService;

        if (!game) {
            // Check if it's a blackjack game (starts with 'bj-' or is numeric/known ID)
            // Or just try to get/create if it's not a poker game
            game = blackjackService.getOrCreateGame(gameId);
            service = blackjackService;
        }

        if (!game) {
            game = RouletteService.rouletteGames.find(
                (g) => g.getGameId().toString() === gameId.toString()
            );
            service = rouletteService;
        }

        if (!game) {
            socket.emit("error", { message: `Game ${gameId} not found` });
            return;
        }

        const username = user?.username ?? '-';
        const displayname = user?.displayname || user?.username || 'Guest';
        const balance = user?.balance ?? startBalance; console.log("DEBUG: join_game, userId:", userId, "balance from user:", user?.balance, "final balance:", balance);

        const existingPlayer = game.getPlayers().find((p: any) => p.getPlayerId() === userId);
        if (!existingPlayer) {
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
            } else if (service === blackjackService) {
                await blackjackService.addPlayer(
                    userId,
                    user?.userName ?? '-',
                    user?.displayName ?? 'Guest',
                    user?.balance ?? startBalance,
                    gameId
                );
            } else if (service === rouletteService) {
                await rouletteService.addPlayer(
                    userId,
                    username,
                    displayname,
                    balance,
                    gameId
                );
            }
        } else {
            // Update existing player info in case it was "Guest" before
            existingPlayer.updatePlayerInfo(username, displayname);
            console.log(`Updated existing player ${userId} info: ${displayname}`);

            // Emit updated state to everyone so they see the name change
            io.to(gameId).emit("game_state", game.getGameState());
        }

        if (game.listenerCount("gameState") === 0) {
            game.on("gameState", (state: any) => {
                io.to(gameId).emit("game_state", state);
            });
        }

        const playerCount = game.getGameState().players.length;
        // Start game based on type
        if (service === pokerService && playerCount >= 2 && playerCount <= 5) {
            game.startGameStartTimer();
        } else if (service === blackjackService && playerCount >= 1) {
            game.startGame();
        } else if (service === rouletteService && playerCount >= 1) {
            game.startGame();
        }
        socket.emit("game_state", game.getGameState());
        // send game state to everyone in the room when a new player joins
        socket.to(gameId).emit("game_state", game.getGameState());
    });

    socket.on("player_move", async (data: { gameId: string; action: string; amount?: number; field?: string }) => {
        const { gameId, action, amount, field } = data;
        const playerId = socketUserMap.get(socket.id);

        if (!playerId) {
            console.warn(`Unknown socket tried making a move: ${socket.id}`);
            return;
        }

        console.log(`Player ${playerId} performed action: ${action} in game: ${gameId} with amount: ${amount} on field: ${field}`);

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
                    // Try poker first, then blackjack, then roulette
                    actionResult = await pokerService.bet(playerId, gameId, amount);
                    if (!actionResult.success) {
                        actionResult = await blackjackService.bet(playerId, gameId, amount);
                    }
                    if (!actionResult.success && field) {
                        actionResult = await rouletteService.bet(playerId, gameId, amount, field);
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
            case "ready":
                actionResult = await rouletteService.ready(playerId, gameId);
                break;
        }

        if (!actionResult.success) {
            console.warn(`Action failed for player ${playerId} in game ${gameId}: ${actionResult.message}`);
            socket.emit("error", { message: actionResult.message });
        }
    });

    socket.on("set_desired_bet", async (data: { gameId: string; amount: number }) => {
        const { gameId, amount } = data;
        const playerId = socketUserMap.get(socket.id);
        if (!playerId) return;

        let { game } = pokerService.getGameById(gameId);
        if (!game) {
            game = blackjackService.getGameById(gameId).game as any;
        }
        if (!game) {
            game = rouletteService.getGameById(gameId).game as any;
        }

        if (game) {
            const player = game.getPlayers().find((p: any) => p.getPlayerId() === playerId);
            if (player) {
                player.setDesiredBet(amount);
                io.to(gameId).emit("game_state", game.getGameState());
            }
        }
    });

    socket.on("tip_dealer", async (data: { gameId: string }) => {
        const { gameId } = data;
        const playerId = socketUserMap.get(socket.id);
        if (!playerId) return;

        console.log(`Player ${playerId} is tipping the dealer in game: ${gameId}`);
        const result = await pokerService.tipDealer(playerId, gameId);
        if (!result.success) {
            socket.emit("error", { message: result.message });
        }
    });

    socket.on("disconnect", () => {
        const userId = socketUserMap.get(socket.id);
        console.log(`User disconnected: ${socket.id} (User: ${userId})`);

        if (userId) {
            // Notify games about disconnection
            PokerService.pokerGames.forEach(game => {
                if (typeof (game as any).handlePlayerDisconnect === 'function') {
                    (game as any).handlePlayerDisconnect(userId);
                }
            });
            BlackjackService.blackjackGames.forEach(game => {
                if (typeof (game as any).handlePlayerDisconnect === 'function') {
                    (game as any).handlePlayerDisconnect(userId);
                }
            });
            RouletteService.rouletteGames.forEach(game => {
                if (typeof (game as any).handlePlayerDisconnect === 'function') {
                    (game as any).handlePlayerDisconnect(userId);
                }
            });
        }

        if (userId) {
            // Find games the user might be in and remove them
            [...PokerService.pokerGames, ...BlackjackService.blackjackGames, ...RouletteService.rouletteGames].forEach(game => {
                if (game.getPlayers().find(p => p.getPlayerId() === userId)) {
                    game.removePlayer(userId);
                }
            });
        }
        socketUserMap.delete(socket.id);
    });
});

httpServer.listen(PORT, () => console.log(`Server running on: http://localhost:${PORT}`));

DB.createDBConnection();
pokerService.loadAllPokerGames();
blackjackService.loadAllBlackjackGames();
rouletteService.loadAllRouletteGames();
console.log("DEBUG: Roulette games loaded. Count:", RouletteService.rouletteGames.length);
