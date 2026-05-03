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

const startServer = async () => {
    await DB.createDBConnection();

    const pokerservice: PokerService = new PokerService();
    await pokerservice.loadAllPokerGames();

    const socketUserMap: Map<string, string> = new Map();

    // Socket.io connection handling
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on("join_game", async (gameId, userId) => {
            console.log("join_game received:", gameId, userId);
            console.log("Games loaded:", PokerService.pokerGames.length);
            console.log("Game IDs:", PokerService.pokerGames.map(g => g.getGameId()));
            socketUserMap.set(socket.id, userId);

            socket.join(gameId);
            console.log(`User ${userId} joined game: ${gameId}`);

            const userService = new UserService();
            const user = await userService.getUserById(userId);

            const startBalance: number = 1000;

            // Send initial state
            const game = PokerService.pokerGames.find(g => g.getGameId().toString() === gameId.toString());
            if (game) {
                const alreadyIn = game.getGameState().players.some(p => p.id === userId);
                if (!alreadyIn) {
                    await pokerservice.addPlayer(
                        userId,
                        user?.username ?? '-',
                        user?.displayname ?? 'Guest',
                        startBalance,
                        false,
                        0,
                        gameId
                    );
                }

                if (game.listenerCount("gameState") === 0) {
                    game.on("gameState", (state) => {
                        io.to(gameId).emit("game_state", state);
                    });
                }

                const playerCount = game.getGameState().players.length;
                // Spiel starten, sobald min. 2 Spieler da sind
                if (playerCount === 2) {
                    game.startGame();
                }

                socket.emit("game_state", game.getGameState());
            }
        });

        socket.on("player_move", async (data: { gameId: string, action: string, amount?: number }) => {
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
                    actionResult = await pokerservice.fold(playerId, gameId);
                    break;
                case "check":
                    actionResult = await pokerservice.check(playerId, gameId);
                    break;
                case "call":
                    actionResult = await pokerservice.call(playerId, gameId);
                    break;
                case "bet":
                    if (amount !== undefined) actionResult = await pokerservice.bet(playerId, gameId, amount);
                    break;
                case "raise":
                    if (amount !== undefined) actionResult = await pokerservice.raise(playerId, gameId, amount);
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
};
