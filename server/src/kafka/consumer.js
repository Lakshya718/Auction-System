import dotenv from "dotenv";
dotenv.config();

import { Kafka } from "kafkajs";
import {
  redisClient,
  connectRedis,
  isRedisReady,
  safeRedisOperation,
} from "../utils/redisClient.js";
import { isValidObjectId } from "mongoose";

const kafka = new Kafka({
  clientId: "bidify-consumer",
  brokers: ["localhost:9092"],
  retry: {
    initialRetryTime: 300,
    retries: 10,
    maxRetryTime: 30000,
  },
});

const consumer = kafka.consumer({
  groupId: "bidify-group",
  retry: {
    initialRetryTime: 300,
    retries: 10,
    maxRetryTime: 30000,
  },
});

// Flag to track consumer connection status
let consumerConnected = false;

// Add event listeners for connection status
consumer.on("consumer.connect", () => {
  console.log("Consumer connected to Kafka");
  consumerConnected = true;
});

consumer.on("consumer.disconnect", () => {
  console.log("Consumer disconnected from Kafka");
  consumerConnected = false;
  // Try to reconnect after a delay
  setTimeout(async () => {
    try {
      if (!consumerConnected) {
        console.log("Attempting to reconnect consumer...");
        await consumer.connect();
        await consumer.subscribe({ topic: "bids", fromBeginning: false });
        console.log("Consumer reconnected successfully");
      }
    } catch (error) {
      console.error("Failed to reconnect consumer:", error.message);
    }
  }, 5000);
});

let io;

const run = async (socketIoInstance) => {
  io = socketIoInstance;

  try {
    // Try to connect to Redis, but continue even if it fails
    try {
      await connectRedis();
    } catch (redisError) {
      console.warn(
        "Redis connection failed in Kafka consumer, but continuing:",
        redisError.message
      );
    }

    try {
      console.log("Attempting to connect to Kafka consumer...");

      // Try to connect with a timeout
      await Promise.race([
        consumer.connect(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Kafka connection timeout after 5 seconds")),
            5000
          )
        ),
      ]);

      console.log("Kafka consumer connected successfully");
      consumerConnected = true;
      await consumer.subscribe({ topic: "bids", fromBeginning: false });
      console.log("Kafka consumer connected and subscribed to 'bids' topic");
    } catch (kafkaError) {
      console.error("Failed to connect Kafka consumer:", kafkaError.message);
      console.warn(
        "App started without Kafka consumer connection - will retry connection periodically"
      );

      // Set up a reconnection interval
      const reconnectInterval = setInterval(async () => {
        if (!consumerConnected) {
          try {
            console.log("Attempting to reconnect Kafka consumer...");
            await consumer.connect();
            consumerConnected = true;
            await consumer.subscribe({ topic: "bids", fromBeginning: false });
            console.log("Kafka consumer reconnected successfully");
            clearInterval(reconnectInterval);

            // Start running consumer after successful reconnection
            startConsumer();
          } catch (error) {
            console.error("Failed to reconnect Kafka consumer:", error.message);
          }
        } else {
          clearInterval(reconnectInterval);
        }
      }, 10000); // Try every 10 seconds

      // Return early - the consumer will start after reconnection
      return;
    }

    // Start the consumer if connected
    if (consumerConnected) {
      startConsumer();
    }
  } catch (error) {
    console.error("Kafka consumer setup error:", error);
  }
};

// Function to start the consumer processing
const startConsumer = async () => {
  try {
    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const bid = JSON.parse(message.value.toString());

          console.log(`Received bid amount: ${bid.amount}`);

          if (
            !isValidObjectId(bid.auctionId) ||
            !isValidObjectId(bid.playerId) ||
            !isValidObjectId(bid.teamId)
          ) {
            throw new Error("Invalid bid data: Invalid IDs");
          }

          if (!bid.amount || bid.amount <= 0) {
            throw new Error("Invalid bid amount");
          }

          let currentBid = 0;
          let shouldRejectBid = false;

          // Only try Redis operations if Redis is available
          if (isRedisReady()) {
            try {
              const redisKey = `auction:${bid.auctionId}:player:${bid.playerId}`;
              const currentBidData = await safeRedisOperation(async () => {
                return await redisClient.hGetAll(redisKey);
              }, {});

              currentBid = currentBidData.currentBid
                ? parseFloat(currentBidData.currentBid)
                : 0;

              console.log(`Current bid for player: ${currentBid}`);

              if (!currentBidData || Object.keys(currentBidData).length === 0) {
                console.warn(
                  `Warning: Redis key ${redisKey} is empty or missing. Initializing currentBid to 0.`
                );
              }

              if (bid.amount <= currentBid) {
                shouldRejectBid = true;
                throw new Error("Bid amount must be higher than current bid");
              }

              // Retrieve existing Redis data for player
              const existingDataStr = await safeRedisOperation(async () => {
                return await redisClient.get(bid.playerId);
              }, null);

              let existingData = {};
              if (existingDataStr) {
                try {
                  existingData = JSON.parse(existingDataStr);
                } catch (err) {
                  console.error("Error parsing existing Redis data:", err);
                }
              }

              // Reject bid if currentTeam is same as bidding team
              if (
                existingData.currentTeam &&
                existingData.currentTeam === bid.teamId
              ) {
                shouldRejectBid = true;
                throw new Error("Current team cannot place consecutive bids");
              }

              // Update currentBid and currentTeam
              existingData.currentBid = bid.amount;
              existingData.currentTeam = bid.teamId;

              // Save updated data back to Redis
              await safeRedisOperation(async () => {
                await redisClient.set(
                  bid.playerId,
                  JSON.stringify(existingData)
                );
              });

              // Also update the Redis hash key for auction-player currentBid and currentTeam
              await safeRedisOperation(async () => {
                await redisClient.hSet(redisKey, {
                  currentBid: bid.amount,
                  currentTeam: bid.teamId,
                });
              });

              // Log Redis transaction details
              console.log(
                `Redis transaction - Updated player data for playerId: ${bid.playerId} with currentBid: ${bid.amount} and currentTeam: ${bid.teamId} at ${bid.timestamp}`
              );
            } catch (redisOpError) {
              console.error(
                "Redis operation failed in Kafka consumer:",
                redisOpError.message
              );
              // Continue with the bid process even if Redis operations fail, unless it's a validation error
              if (shouldRejectBid) {
                throw redisOpError;
              }
            }
          } else {
            console.warn(
              "Redis not available for bid processing, proceeding without Redis operations"
            );
          }

          // Emit socket.io event with updated bid state
          if (io) {
            io.to(bid.auctionId).emit("bidUpdate", {
              auctionId: bid.auctionId,
              playerId: bid.playerId,
              currentBid: bid.amount,
              currentTeam: bid.teamId, // Use currentTeam as last bidder
              timestamp: bid.timestamp,
            });
            // Emit refresh-player-data event after Redis update is completed
            io.to(bid.auctionId).emit("refresh-player-data", {
              playerId: bid.playerId,
            });
          }

          console.log(`Processed bid in Redis: ${JSON.stringify(bid)}`);
        } catch (error) {
          console.error("Error processing bid:", error);

          // Even if there's an error, still emit an error notification
          if (io && bid) {
            io.to(bid.auctionId).emit("bidError", {
              auctionId: bid.auctionId,
              playerId: bid.playerId,
              error: error.message,
            });
          }
        }
      },

      // Add KafkaJS consumer run options
      autoCommit: true,
      autoCommitInterval: 5000, // Commit offsets every 5 seconds
      autoCommitThreshold: 10, // Commit after 10 messages
      partitionsConsumedConcurrently: 1, // Process one partition at a time
    });
  } catch (error) {
    console.error("Kafka consumer run error:", error);
    consumerConnected = false;
  }
};

export { run };
