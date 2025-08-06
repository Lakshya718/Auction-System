import express from "express";
import {
  createAuction,
  getAllAuctions,
  getAuctionById,
  updateAuctionStatus,
  sellPlayer,
  updateAuction,
} from "../controllers/auction.controller.js";
import { auth, adminOnly } from "../middleware/auth.js";
import { sendBidToKafka, initKafkaProducer } from "../kafka/producer.js";
import { connectRedis, isRedisReady } from "../utils/redisClient.js";

const router = express.Router();

router.post("/create", auth, adminOnly, createAuction);
router.get("/all-auctions", auth, getAllAuctions);
router.get("/sport/:sport/tournaments", auth, async (req, res) => {
  try {
    const { sport } = req.params;

    // Import Auction model inside the route handler to avoid circular dependencies
    const Auction = (await import("../models/Auction.js")).default;

    // Find auctions filtered by sport
    const auctions = await Auction.find({ sport });

    return res.status(200).json({
      success: true,
      auctions,
    });
  } catch (error) {
    console.error("Error fetching sport-specific tournaments:", error);
    return res.status(500).json({
      success: false,
      error: "Error fetching sport-specific tournaments",
    });
  }
});
router.get("/:id", auth, getAuctionById);
router.patch("/:id/status", auth, adminOnly, updateAuctionStatus);
router.patch("/:id", auth, adminOnly, updateAuction);

// New endpoint to start auction services (Redis and Kafka)
router.post("/start-services", auth, adminOnly, async (req, res) => {
  try {
    console.log("Starting auction services (Redis and Kafka)...");

    // Step 1: Start Redis
    let redisStatus = "connected";
    try {
      await connectRedis();
      // Add a small delay to ensure the connection is properly established
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!isRedisReady()) {
        console.log("Redis is not ready after connection attempt");
        redisStatus = "error";
      } else {
        console.log("Redis is ready and connected");
      }
    } catch (redisError) {
      console.error("Failed to connect to Redis:", redisError);
      redisStatus = "error";
    }

    // Step 2: Start Kafka
    let kafkaStatus = "connected";
    try {
      await initKafkaProducer();

      // Perform a simple Kafka operation to verify connection
      try {
        // Create a simple test message
        const testMessage = {
          auctionId: "test-auction-id",
          playerId: "test-player-id",
          teamId: "test-team-id",
          amount: 100,
          timestamp: new Date().toISOString(),
        };

        // Try to send it using the sendBidToKafka function
        const kafkaResult = await sendBidToKafka(testMessage);
        if (!kafkaResult.success) {
          console.error("Kafka test failed:", kafkaResult.error);
          kafkaStatus = "error";
        } else {
          console.log("Kafka test message sent successfully");
        }
      } catch (testError) {
        console.error("Failed to send test message to Kafka:", testError);
        kafkaStatus = "error";
      }
    } catch (kafkaError) {
      console.error("Failed to connect to Kafka:", kafkaError);
      kafkaStatus = "error";
    }

    console.log(
      `Service status - Redis: ${redisStatus}, Kafka: ${kafkaStatus}`
    );

    // Always return success: true for consistency but include actual statuses
    return res.status(200).json({
      success: true,
      message: "Auction services status checked",
      services: {
        redis: redisStatus,
        kafka: kafkaStatus,
      },
    });
  } catch (error) {
    console.error("Error starting auction services:", error);
    return res.status(500).json({
      success: false,
      message: "Error starting auction services",
      error: error.message,
    });
  }
});

// Start Redis route
router.post("/start-redis", auth, adminOnly, async (req, res) => {
  try {
    const redisClient = req.app.get("redisClient");
    if (!redisClient || !redisClient.isReady) {
      return res.status(500).json({
        success: false,
        message: "Redis connection is not ready",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Redis connection verified and ready",
    });
  } catch (error) {
    console.error("Error verifying Redis connection:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying Redis connection",
    });
  }
});

// New POST /bid route
router.post("/bid", auth, async (req, res) => {
  try {
    const { auctionId, playerId, teamId, amount } = req.body;

    console.log(`Received bid request:`, req.body);

    if (!auctionId || !playerId || !teamId || !amount) {
      console.error("Missing required bid fields:", req.body);
      return res.status(400).json({
        success: false,
        error: "Missing required bid fields",
      });
    }

    const bidData = {
      auctionId,
      playerId,
      teamId,
      amount: parseFloat(amount),
      timestamp: new Date().toISOString(),
    };

    console.log(`Processing bid data:`, bidData);

    // Wrap sendBidToKafka in a try-catch to ensure we always respond to the client
    let kafkaResult;
    try {
      // The updated sendBidToKafka now returns a result object instead of throwing
      kafkaResult = await sendBidToKafka(bidData);
    } catch (kafkaError) {
      console.error("Unexpected error in sendBidToKafka:", kafkaError);
      kafkaResult = {
        success: false,
        error: kafkaError.message,
        bid: bidData,
      };
    }

    // Get the socket.io instance
    const io = req.app.get("io");

    if (kafkaResult && kafkaResult.success) {
      // Bid was successfully sent to Kafka
      console.log("Bid successfully sent to Kafka");
      res.status(200).json({
        success: true,
        message: "Bid sent to Kafka",
        bid: bidData,
      });
    } else {
      // Kafka is unavailable but we'll still process the bid
      console.warn(
        `Kafka unavailable or error, processing bid directly: ${
          kafkaResult.error || "Unknown error"
        }`
      );

      if (io) {
        // Emit the bid update directly via Socket.IO since Kafka is unavailable
        try {
          io.to(bidData.auctionId).emit("bidUpdate", {
            auctionId: bidData.auctionId,
            playerId: bidData.playerId,
            currentBid: bidData.amount,
            currentTeam: bidData.teamId,
            timestamp: bidData.timestamp,
          });

          // Also emit the refresh-player-data event
          io.to(bidData.auctionId).emit("refresh-player-data", {
            playerId: bidData.playerId,
          });

          console.log(
            "Bid update emitted directly via Socket.IO (bypassing Kafka)"
          );
        } catch (socketError) {
          console.error("Error emitting socket event:", socketError);
        }
      } else {
        console.warn("Socket.IO instance not available");
      }

      // Still return success to the client
      res.status(200).json({
        success: true,
        message: "Bid processed directly (Kafka unavailable)",
        bid: bidData,
        kafkaAvailable: false,
      });
    }
  } catch (error) {
    console.error("Unhandled error in /bid route:", error);
    // Always return a 200 response with success=false to ensure client can handle it
    res.status(200).json({
      success: false,
      error: error.message || "An unexpected error occurred",
      message: "Failed to process bid but system is still operational",
    });
  }
});

// New POST /sell-player route
router.post("/sell-player", auth, adminOnly, sellPlayer);

export default router;
