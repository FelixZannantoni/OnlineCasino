import express from "express";
import cors from "cors";
import { StatusCodes } from "http-status-codes";
import "dotenv/config";
import { DB } from "./data";
import { userRouter } from "./router/user-router";

const PORT = process.env.PORT;

const app = express();
app.use(cors());
app.use(express.json());
app.use("/users", userRouter);


app.listen(PORT, () => console.log(`Server running on: http://localhost:${PORT}`));

DB.createDBConnection();