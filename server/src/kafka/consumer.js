import dotenv from 'dotenv';
dotenv.config();

import { Kafka } from 'kafkajs';
import mongoose from 'mongoose';
import Auction from '../models/Auction.js';
import { isValidObjectId } from 'mongoose';

const kafka = new Kafka({
  clientId: 'bidify-consumer',
  brokers: ['localhost:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

const consumer = kafka.consumer({ groupId: 'bidify-group' });

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  try {
    await consumer.connect();
    await consumer.subscribe({ topic: 'bids', fromBeginning: false });
    console.log('Kafka consumer connected');

    await consumer.run({
      eachMessage: async ({ message }) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
          const bid = JSON.parse(message.value.toString());

          if (!isValidObjectId(bid.auctionId) || !isValidObjectId(bid.playerId) || !isValidObjectId(bid.teamId)) {
            throw new Error('Invalid bid data: Invalid IDs');
          }

          if (!bid.amount || bid.amount <= 0) {
            throw new Error('Invalid bid amount');
          }

          const auction = await Auction.findById(bid.auctionId).session(session);
          if (!auction || auction.status !== 'active') {
            throw new Error('Auction is not active');
          }

          const player = auction.players.find(p => p.player.toString() === bid.playerId);
          if (!player || player.status !== 'available') {
            throw new Error('Player is not available for bidding');
          }

          const teamBudget = auction.teamBudgets.find(b => b.team.toString() === bid.teamId);
          if (!teamBudget || teamBudget.remainingBudget < bid.amount) {
            throw new Error('Insufficient team budget');
          }

          if (bid.amount < player.currentBid + auction.minBidIncrement) {
            throw new Error(`Bid must be at least ${player.currentBid + auction.minBidIncrement}`);
          }

          await Auction.updateOne(
            { _id: bid.auctionId, 'players.player': bid.playerId },
            {
              $push: {
                'players.$.biddingHistory': {
                  team: bid.teamId,
                  amount: bid.amount,
                  timestamp: bid.timestamp
                }
              },
              $set: {
                'players.$.currentBid': bid.amount,
                'players.$.currentHighestBidder': bid.teamId
              }
            },
            { session }
          );

          await session.commitTransaction();
          console.log(`Processed bid: ${JSON.stringify(bid)}`);
        } catch (error) {
          await session.abortTransaction();
          console.error('Error processing bid:', error);
        } finally {
          session.endSession();
        }
      }
    });
  } catch (error) {
    console.error('Kafka consumer error:', error);
  }
};

run().catch(console.error);