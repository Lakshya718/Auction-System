import dotenv from "dotenv";
dotenv.config();

import { Kafka } from "kafkajs";
import { redisClient, connectRedis } from "../utils/redisClient.js";
import { isValidObjectId } from "mongoose";

const kafka = new Kafka({
  clientId: "bidify-consumer",
  brokers: ["localhost:9092"],
  retry: {
    initialRetryTime: 100,
    retries: 8,
  },
});

const consumer = kafka.consumer({ groupId: "bidify-group" });

let io;

const run = async (socketIoInstance) => {
  io = socketIoInstance;

  try {
    await connectRedis();
    await consumer.connect();
    await consumer.subscribe({ topic: "bids", fromBeginning: false });
    console.log("Kafka consumer connected");

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

          const redisKey = `auction:${bid.auctionId}:player:${bid.playerId}`;
          const currentBidData = await redisClient.hGetAll(redisKey);

          const currentBid = currentBidData.currentBid
            ? parseFloat(currentBidData.currentBid)
            : 0;

          console.log(`Current bid for player: ${currentBid}`);

          if (!currentBidData || Object.keys(currentBidData).length === 0) {
            console.warn(
              `Warning: Redis key ${redisKey} is empty or missing. Initializing currentBid to 0.`
            );
          }

          if (bid.amount <= currentBid) {
            throw new Error("Bid amount must be higher than current bid");
          }

          // Retrieve existing Redis data for player
          const existingDataStr = await redisClient.get(bid.playerId);
          let existingData = {};
          if (existingDataStr) {
            try {
              existingData = JSON.parse(existingDataStr);
            } catch (err) {
              console.error("Error parsing existing Redis data:", err);
            }
          }

          // Reject bid if currentTeam is same as bidding team
          if (existingData.currentTeam && existingData.currentTeam === bid.teamId) {
            throw new Error("Current team cannot place consecutive bids");
          }

          // Update currentBid and currentTeam
          existingData.currentBid = bid.amount;
          existingData.currentTeam = bid.teamId;

          // Save updated data back to Redis
          await redisClient.set(bid.playerId, JSON.stringify(existingData));

          // Also update the Redis hash key for auction-player currentBid and currentTeam
          await redisClient.hSet(redisKey, {
            currentBid: bid.amount,
            currentTeam: bid.teamId,
          });

          // Log Redis transaction details
          console.log(
            `Redis transaction - Updated player data for playerId: ${bid.playerId} with currentBid: ${bid.amount} and currentTeam: ${bid.teamId} at ${bid.timestamp}`
          );

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
        }
      },
    });
  } catch (error) {
    console.error("Kafka consumer error:", error);
  }
};

export { run };
