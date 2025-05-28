import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.js";
import teamRoutes from "./routes/teams.js";
import playerRoutes from "./routes/players.js";
import auctionRoutes from "./routes/auctions.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { setupSocketServer } from "./socketServer.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

setupSocketServer(httpServer);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${req.method}] ${req.originalUrl} ${res.statusCode} - ${duration} ms`
    );
  });
  next();
});

app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/auctions", auctionRoutes);

// setupSocketHandlers(io);

app.use(errorHandler);

mongoose
  .connect(
    "mongodb+srv://22bcs059:Lakshya%23718@auction-database.hcke291.mongodb.net/?retryWrites=true&w=majority&appName=auction-database"
  )
  .then(() => {
    console.log("Connected to MongoDB");
    const PORT = 5000;
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port 5000`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });
