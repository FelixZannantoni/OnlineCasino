import express from "express";
import cors from "cors";
import { StatusCodes } from "http-status-codes";
import "dotenv/config";
import { DB } from "./data";
import { userRouter } from "./router/user-router";
import { pokerRouter } from "./router/poker-router";
import { PokerService } from "./services/poker-service";

const PORT = process.env.PORT;

const app = express();
app.use(cors());
app.use(express.json());
app.use("/users", userRouter);
app.use("/poker", pokerRouter);

const startServer = async () => {
    await DB.createDBConnection();

    const pokerservice: PokerService = new PokerService();
    await pokerservice.loadAllPokerGames();

    app.listen(PORT, () => console.log(`Server running on: http://localhost:${PORT}`));
};

startServer();