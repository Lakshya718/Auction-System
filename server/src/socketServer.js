import { Server } from 'socket.io';
import Team from './models/Team.js';
import Player from './models/Player.js';

export const setupSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Server-side state
  let currentPlayer = null;
  let currentBid = 0;
  let currentTeam = null;
  let bidNotifications = [];

  const MAX_BID = 140000000; // 14 crore

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Send current state to new connection
    socket.on('request-current-state', () => {
      socket.emit('current-state', {
        player: currentPlayer,
        currentBid,
        currentTeam,
        bidNotifications,
      });
    });

    // Admin sends player info to team owners
    socket.on('send-player', (player) => {
      currentPlayer = player;
      currentBid = player.basePrice || 0;
      currentTeam = null;
      bidNotifications = [];
      // Broadcast player info to all except sender (admin)
      socket.broadcast.emit('player-info', player);
      // Notify all clients of reset bid info
      io.emit('bid-updated', { bidAmount: currentBid, teamOwnerName: null });
    });

    // Team owner clicks bid button
    socket.on('bid-clicked', async ({ teamOwnerName, bidAmount }) => {
      if (bidAmount > MAX_BID) {
        socket.emit('bid-error', 'Bid exceeds maximum allowed limit');
        return;
      }
      if (bidAmount <= currentBid) {
        socket.emit('bid-error', 'Bid must be higher than current bid');
        return;
      }
      currentBid = bidAmount;
      currentTeam = teamOwnerName;
      bidNotifications.push(teamOwnerName);
      if (bidNotifications.length > 50) {
        bidNotifications.shift();
      }
      // Notify all clients about the new bid
      io.emit('bid-notification', { teamOwnerName, bidAmount });
      io.emit('bid-updated', { bidAmount: currentBid, teamOwnerName: currentTeam });
    });

    // Admin approves auction
    socket.on('approve-auction', async ({ player, currentBid, currentTeam }) => {
      try {
        // Find team by name
        const team = await Team.findOne({ name: currentTeam });
        if (!team) {
          socket.emit('approval-error', 'Team not found');
          return;
        }
        // Check if team purse is sufficient
        if (team.purse < currentBid) {
          socket.emit('approval-error', 'Insufficient balance in team purse');
          return;
        }
        // Deduct bid amount from team purse
        team.purse -= currentBid;
        // Add player to team's players list
        const playerDoc = await Player.findOne({ playerName: player.playerName });
        if (!playerDoc) {
          socket.emit('approval-error', 'Player not found in database');
          return;
        }
        team.players.push(playerDoc._id);
        await team.save();

        // Notify all clients of approval
        io.emit('auction-approved', { player, currentBid, currentTeam });
        // Emit player-bought event to all clients for toast message
        io.emit('player-bought', { team: currentTeam, player });
        // Reset auction state
        currentPlayer = null;
        currentBid = 0;
        currentTeam = null;
        bidNotifications = [];
      } catch (error) {
        console.error('Error approving auction:', error);
        socket.emit('approval-error', 'Internal server error during approval');
      }
    });

    // Admin rejects auction
    socket.on('reject-auction', ({ player, currentBid, currentTeam }) => {
      // Notify all clients of rejection
      io.emit('auction-rejected', { player, currentBid, currentTeam });
      // Reset auction state
      currentPlayer = null;
      currentBid = 0;
      currentTeam = null;
      bidNotifications = [];
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};
