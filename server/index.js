import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import redis from "redis";

import authRoutes from "./src/routes/auth.route.js";
import teamRoutes from "./src/routes/team.route.js";
import playerRoutes from "./src/routes/player.route.js";
import auctionRoutes from "./src/routes/auction.route.js";
import matchRoutes from "./src/routes/match.route.js";
import { errorHandler } from "./src/middleware/errorHandler.js";
import { setupSocketHandlers } from "./src/utils/socket.js";
import { initKafkaProducer } from "./src/kafka/producer.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});
const redisClient = redis.createClient({
  url:
    process.env.REDIS_URL ||
    `redis://${process.env.REDIS_HOST || "localhost"}:${
      process.env.REDIS_PORT || 6379
    }`,
});
// Connect Redis client and handle connection events
redisClient
  .connect()
  .then(() => {
    console.log("Connected to Redis");
  })
  .catch((err) => {
    console.error("Redis connection error:", err);
  });

// Add error event listener to handle runtime errors and prevent app crash
redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

// Socket.io setup
setupSocketHandlers(io);

// Attach io to app for controller access
app.set("io", io);
// Attach Redis client to app for access in controllers/middleware
app.set("redisClient", redisClient);

// await initKafkaProducer();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
  })
);

// Debug middleware
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Serve static files
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/matches", matchRoutes);

// Error handling middleware
app.use(errorHandler);

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });
