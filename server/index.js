import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";

//routes
import authRoutes from "./src/routes/auth.route.js";
import teamRoutes from "./src/routes/team.route.js";
import playerRoutes from "./src/routes/player.route.js";
import auctionRoutes from "./src/routes/auction.route.js";
import matchRoutes from "./src/routes/match.route.js";

// Utils
import { errorHandler } from "./src/middleware/errorHandler.js";
import { setupSocketHandlers } from "./src/utils/socket.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Define allowed origins
const defaultOrigins = [
  "http://localhost:5173", 
  "https://auction-system-deploy.onrender.com", 
  "https://auction-system-lakshya.vercel.app"
];

// Combine environment origins with default origins
const getAllowedOrigins = () => {
  const envOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
  return [...new Set([...defaultOrigins, ...envOrigins])];
};

const allowedOrigins = getAllowedOrigins();

console.log('Allowed CORS origins:', allowedOrigins);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});

// Socket.io setup
setupSocketHandlers(io);

// Attach io to app for controller access
app.set("io", io);

// CORS configuration - must be before other middleware
app.use(
  cors({
    origin: function (origin, callback) {
      console.log('CORS request from origin:', origin);
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('Origin not allowed by CORS:', origin);
        console.log('Allowed origins:', allowedOrigins);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Access-Control-Allow-Origin",
      "X-Requested-With",
      "Range",
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 200,
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Additional preflight handler for manual CORS control
app.options("*", (req, res) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || !origin) {
    res.header("Access-Control-Allow-Origin", origin || "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Accept, X-Requested-With, Range"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Max-Age", "86400"); // 24 hours
  }
  res.sendStatus(200);
});

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

// Start DB connection
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
