import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { StatusCodes } from "http-status-codes";
import "dotenv/config";
import { DB } from "./data";
import { userRouter } from "./router/user-router";
import { pokerRouter } from "./router/poker-router";
import { PokerService } from "./services/poker-service";
import { Poker } from "./gameLogic/poker";
import { UserService } from "./services/user-service";

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

const socketUserMap: Map<string, string> = new Map();

// Socket.io connection handling
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join_game", async (gameId, userId) => {
        socketUserMap.set(socket.id, userId);

        socket.join(gameId);
        console.log(`User ${userId} joined game: ${gameId}`);

        const userService = new UserService();
        const user = await userService.getUserById(userId);

        const service: PokerService = new PokerService();
        const startBalance: number = 1000;
        service.addPlayer(userId, user?.username ?? '-', user?.displayname ?? 'Guest', startBalance, false, 0, gameId);
        
        // Send initial state
        const game = PokerService.pokerGames.find(g => g.getGameId() === gameId);
        if (game) {
            socket.emit("game_state", game.getGameState());
            
            // Listen for changes if not already listening
            if (game.listenerCount("gameState") === 0) {
                game.on("gameState", (state) => {
                    io.to(gameId).emit("game_state", state);
                });
            }
        }
    });

    socket.on("player_move", (data: { gameId: string, action: string, amount?: number }) => {
        const { gameId, action, amount } = data;
        const playerId = socketUserMap.get(socket.id);

        if (!playerId) {
            console.warn(`Unknown socket tried making a move: ${socket.id}`);
            return;
        }
        const service = new PokerService();
        
        console.log(`Player ${playerId} performed action: ${action} in game: ${gameId} with amount: ${amount}`);

        let actionResult = {success: false, message: "Invalid action"};

        switch (action) {
            case "fold":
                actionResult = service.fold(playerId, gameId);
                break;
            case "check":
                actionResult = service.check(playerId, gameId);
                break;
            case "call":
                actionResult = service.call(playerId, gameId);
                break;
            case "bet":
                if (amount !== undefined) actionResult = service.bet(playerId, gameId, amount);
                break;
            case "raise":
                if (amount !== undefined) actionResult = service.raise(playerId, gameId, amount);
                break;
        }

        if (!actionResult.success) {
            console.warn(`Action failed for player ${playerId} in game ${gameId}: ${actionResult.message}`);
        }
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        socketUserMap.delete(socket.id);
        // TODO: eventuell player aus Spiel entfernen markieren -> Pokerservice
    });
});

httpServer.listen(PORT, () => console.log(`Server running on: http://localhost:${PORT}`));

DB.createDBConnection();

const pokerservice: PokerService = new PokerService();
pokerservice.loadAllPokerGames();

export { io };