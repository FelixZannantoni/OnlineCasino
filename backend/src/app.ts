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

// Socket.io connection handling
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join_game", (gameId) => {
        socket.join(gameId);
        console.log(`User ${socket.id} joined game: ${gameId}`);
        
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

    socket.on("player_move", (data: { gameId: string, playerId: string, action: string, amount?: number }) => {
        const { gameId, playerId, action, amount } = data;
        const service = new PokerService();
        
        switch (action) {
            case "fold":
                service.fold(playerId, gameId);
                break;
            case "check":
                service.check(playerId, gameId);
                break;
            case "call":
                service.call(playerId, gameId);
                break;
            case "bet":
                if (amount !== undefined) service.bet(playerId, gameId, amount);
                break;
            case "raise":
                if (amount !== undefined) service.raise(playerId, gameId, amount);
                break;
        }
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

httpServer.listen(PORT, () => console.log(`Server running on: http://localhost:${PORT}`));

DB.createDBConnection();

const pokerservice: PokerService = new PokerService();
pokerservice.loadAllPokerGames();

export { io };