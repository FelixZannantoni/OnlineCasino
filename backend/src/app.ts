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
import { Roulette } from "./gameLogic/roulette";
import { UserService } from "./services/user-service";
import { BlackjackService } from "./services/blackjack-service";
import { RouletteService } from "./services/roulette-service";
import { RoundService } from "./services/round-service";
import { StatsService } from "./services/stats-service";
import { statsRouter } from "./router/stats-router";
import { ChatService } from "./services/chat-service";
import { chatRouter } from "./router/chat-router";
import { normalizeUserId } from "./utils";
import { CosmeticsService } from "./services/cosmetics-service";
import { ClubService } from "./services/club-service";
import { clubRouter } from "./router/club-router";

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
app.use("/stats", statsRouter);
app.use("/chats", chatRouter);
app.use("/clubs", clubRouter);

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
const roundService: RoundService = new RoundService();
const statsService: StatsService = new StatsService();
const clubService: ClubService = new ClubService();

const chatService: ChatService = new ChatService();
export { pokerService, blackjackService, rouletteService, userService, roundService, chatService, onlineUsers, statsService, clubService };

export function onMessageSentToUser(receiverId: string) {
    // Find the socket ID for the receiver
    // socket id map is Map<socketId, userId>, so we need to find the socketId for the receiverId
    console.log(`Attempting to notify user ${receiverId} of new message`);
    const receiverSocketId = Array.from(socketUserMap.entries()).find(([socketId, userId]) => userId === receiverId)?.[0];

    if (receiverSocketId) {
        io.to(receiverSocketId).emit("new_message");
        console.log(`Notified user ${receiverId} of new message via socket ${receiverSocketId}`);
    }
}
const cosmeticsService: CosmeticsService = new CosmeticsService();

io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

  
  socket.on('register', (userId: string | number) => {
        socketUserMap.set(socket.id, normalizeUserId(userId));
        onlineUsers.set(normalizeUserId(userId), "online");
    })
    socket.on("join_game", async (gameId: string, userId: string, stakes?: string, gameName?: string) => {
        console.log("join_game received:", gameId, userId, "stakes:", stakes, "name:", gameName);
        socketUserMap.set(socket.id, userId);
   
        socket.join(gameId);
        console.log(`User ${userId} joined game: ${gameId}`);

        const user = await userService.getUserById(userId);

        let game: any = null;
        let service: any = null;

        // Try to find the game in each service
        game = PokerService.pokerGames.find((g) => g.getGameId().toString() === gameId.toString());
        if (game) {
            service = pokerService;
        } else {
            game = blackjackService.getGameById(gameId).game;
            if (game) {
                service = blackjackService;
            } else {
                game = RouletteService.rouletteGames.find((g) => g.getGameId().toString() === gameId.toString());
                if (game) {
                    service = rouletteService;
                }
            }
        }

        // If not found, check if it should be created (Roulette case)
        if (!game) {
            if (gameId.startsWith("roulette")) {
                const name = gameName || `Roulette ${gameId}`;
                game = new Roulette(gameId, name);
                RouletteService.rouletteGames.push(game);
                service = rouletteService;
            } else if (gameId.startsWith("blackjack")) {
                game = blackjackService.getOrCreateGame(gameId, gameName || `Blackjack ${gameId}`);
                service = blackjackService;
            } else if (gameId.startsWith("poker")) {
                const name = gameName || `Poker ${gameId}`;
                game = new Poker(gameId, name);
                PokerService.pokerGames.push(game);
                service = pokerService;
            }
        }

        if (!game) {
            socket.emit("error", { message: `Game ${gameId} not found` });
            return;
        }
        if (!user) {
            socket.emit("error", { message: `User ${userId} not found` });
            return;
        }

        const startBalance = 1000;
        const username = user.userName ?? '-';
        const displayname = user.displayName || user.userName || 'Guest';
        const balance = user.balance; 
        console.log("DEBUG: join_game, userId:", userId, "balance from user:", user.balance, "final balance:", balance);

        const existingPlayer = game.getPlayers().find((p: any) => p.getPlayerId() === userId);
        if (!existingPlayer) {
            let addResult = { success: true, message: "" };
            if (service === pokerService) {
                addResult = await pokerService.addPlayer(
                    userId,
                    user?.userName ?? '-',
                    user?.displayName ?? 'Guest',
                    user?.balance ?? startBalance,
                    false,
                    0,
                    gameId
                );
            } else if (service === blackjackService) {
                addResult = await blackjackService.addPlayer(
                    userId,
                    user?.userName ?? '-',
                    user?.displayName ?? 'Guest',
                    user?.balance ?? startBalance,
                    gameId
                );
            } else if (service === rouletteService) {
                addResult = await rouletteService.addPlayer(
                    userId,
                    username,
                    displayname,
                    balance,
                    gameId
                );
            }

            if (!addResult.success) {
                socket.emit("error", { message: addResult.message });
                return;
            }
        } else {
            // Update existing player info in case it was "Guest" before
            existingPlayer.updatePlayerInfo(username, displayname);
            console.log(`Updated existing player ${userId} info: ${displayname}`);

            // Emit updated state to everyone so they see the name change
            io.to(gameId).emit("game_state", game.getGameState());
        }

        if (game.listenerCount("game_state") === 0) {
            game.on("game_state", (state: any) => {
                io.to(gameId).emit("game_state", state);
            });
        }

        const playerCount = game.getGameState().players.length;
        console.log(`DEBUG: join_game, gameId: ${gameId}, playerCount: ${playerCount}, isRoulette: ${service === rouletteService}`);
        // Start game based on type
        if (service === pokerService && playerCount >= 2 && playerCount <= 5) {
            game.startGameStartTimer();
        } else if (service === blackjackService && playerCount >= 1) {
            game.startGame();
        } else if (service === rouletteService && playerCount >= 1) {
            console.log(`DEBUG: Attempting to start Roulette game: ${gameId}`);
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
