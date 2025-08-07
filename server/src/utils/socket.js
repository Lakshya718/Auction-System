import jwt from 'jsonwebtoken';
import { sendBidToKafka } from '../kafka/producer.js';
import Auction from '../models/Auction.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import Player from '../models/Player.js';
import { isValidObjectId } from 'mongoose';

import { setIoInstance } from './socketInstance.js';

export const setupSocketHandlers = (io) => {
  setIoInstance(io);

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) {
        return next(new Error('User not found'));
      }
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}, User: ${socket.user.email}`);

    // Join auction room
    socket.on('join-auction', async ({ auctionId }) => {
      if (!isValidObjectId(auctionId)) {
        return socket.emit('error', { message: 'Invalid auction ID' });
      }
      const auction = await Auction.findById(auctionId);
      if (!auction) {
        return socket.emit('error', { message: 'Auction not found' });
      }
      socket.join(auctionId);
      socket.emit('joined-auction', { auctionId, message: `Joined auction ${auction.tournamentName}` });
      // Emit to all in room including sender that user joined
      io.to(auctionId).emit('user-joined', { email: socket.user.email });
    });

    // Listen for send-player event from admin and broadcast player-sent event
    socket.on('send-player', ({ auctionId, player }) => {
      // if (socket.user.role === 'admin') {
        io.to(auctionId).emit('player-sent', { player });
        // Emit enable-placebid-button event to enable the placebid button
        io.to(auctionId).emit('enable-placebid-button');
      // }
    });

    // Sell player
    socket.on('sell-player', async ({ auctionId, playerId, teamId, amount }) => {
      try {
        if (socket.user.role !== 'admin') {
          return socket.emit('error', { message: 'Only admins can sell players' });
        }

        if (!isValidObjectId(auctionId) || !isValidObjectId(playerId) || !isValidObjectId(teamId)) {
          return socket.emit('error', { message: 'Invalid auction, player, or team ID' });
        }

        const auction = await Auction.findById(auctionId);
        if (!auction || auction.status !== 'active') {
          return socket.emit('error', { message: 'Auction is not active' });
        }

        const player = auction.players.find(p => p.player.toString() === playerId);
        if (!player || player.status !== 'available') {
          return socket.emit('error', { message: 'Player is not available for sale' });
        }

        const teamBudget = auction.teamBudgets.find(b => b.team.toString() === teamId);
        if (!teamBudget || teamBudget.remainingBudget < amount) {
          return socket.emit('error', { message: 'Insufficient team budget' });
        }

        player.status = 'sold';
        player.soldTo = teamId;
        player.soldPrice = amount;
        teamBudget.remainingBudget -= amount;
        await auction.save();

        io.to(auctionId).emit('player-sold', {
          auctionId,
          playerId,
          teamId,
          amount,
          playerName: (await Player.findById(playerId)).playerName,
          teamName: (await Team.findById(teamId)).name
        });

        // Emit disable-placebid-button event to disable the placebid button
        io.to(auctionId).emit('disable-placebid-button');

        // Audit log
        console.log(`Player sold: ${playerId} to team ${teamId} for ${amount} in auction ${auctionId}`);
      } catch (error) {
        console.error('Error selling player:', error);
        socket.emit('error', { message: error.message || 'Failed to sell player' });
      }
    });

    // Join tournament (auction) room for match updates
    socket.on('join-tournament', async ({ tournamentId }) => {
      if (!isValidObjectId(tournamentId)) {
        return socket.emit('error', { message: 'Invalid tournament ID' });
      }
      const auction = await Auction.findById(tournamentId);
      if (!auction) {
        return socket.emit('error', { message: 'Tournament not found' });
      }
      socket.join(tournamentId);
      socket.emit('joined-tournament', { tournamentId, message: `Joined tournament ${auction.tournamentName}` });
    });

    // Place bid
    socket.on('place-bid', async ({ auctionId, playerId, amount, teamId }) => {
      try {
        if (!isValidObjectId(auctionId) || !isValidObjectId(playerId) || !isValidObjectId(teamId)) {
          return socket.emit('error', { message: 'Invalid auction, player, or team ID' });
        }

        if (socket.user.role !== 'team_owner' || !(await Team.findOne({ _id: teamId, owner: socket.user._id }))) {
          return socket.emit('error', { message: 'Not authorized to bid for this team' });
        }

        const auction = await Auction.findById(auctionId);
        if (!auction || auction.status !== 'active') {
          return socket.emit('error', { message: 'Auction is not active' });
        }

        const player = auction.players.find(p => p.player.toString() === playerId);
        if (!player || player.status !== 'available') {
          return socket.emit('error', { message: 'Player is not available for bidding' });
        }

        const teamBudget = auction.teamBudgets.find(b => b.team.toString() === teamId);
        if (!teamBudget || teamBudget.remainingBudget < amount) {
          return socket.emit('error', { message: 'Insufficient team budget' });
        }

        if (amount < player.currentBid + auction.minBidIncrement) {
          return socket.emit('error', { message: `Bid must be at least ${player.currentBid + auction.minBidIncrement}` });
        }

        const bidData = {
          auctionId,
          playerId,
          teamId,
          amount,
          timestamp: new Date().toISOString()
        };

        await sendBidToKafka(bidData);
        io.to(auctionId).emit('bid-placed', {
          ...bidData,
          playerName: (await Player.findById(playerId)).playerName,
          teamName: (await Team.findById(teamId)).name
        });

        // Audit log
        console.log(`Bid placed: ${socket.user.email} bid ${amount} for player ${playerId} in auction ${auctionId}`);
      } catch (error) {
        console.error('Error placing bid:', error);
        socket.emit('error', { message: error.message || 'Failed to place bid' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      // Initialize rooms map if not already
      if (!io.roomsMap) {
        io.roomsMap = new Map();
      }
      const rooms = io.roomsMap;
      rooms.forEach((teamOwners, roomId) => {
        if (teamOwners.has(socket.user.email)) {
          teamOwners.delete(socket.user.email);
          io.to(roomId).emit('update-team-owners', Array.from(teamOwners));
          console.log(`Team owner ${socket.user.email} left room ${roomId}`);
        }
      });
    });
  });
};
