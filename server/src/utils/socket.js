import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AuctionDetail from '../models/AuctionDetail.js';
import Team from '../models/Team.js';

export const setupSocketHandlers = (io) => {
  // Authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) throw new Error('Authentication required');

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) throw new Error('User not found');

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name}`);

    // Join AuctionDetail room
    socket.on('join-AuctionDetail', async (AuctionDetailId) => {
      try {
        const AuctionDetail = await AuctionDetail.findById(AuctionDetailId)
          .populate('player')
          .populate('currentHighestBidder');
        
        if (!AuctionDetail) throw new Error('AuctionDetail not found');
        
        socket.join(AuctionDetailId);
        socket.emit('AuctionDetail-state', AuctionDetail);
      } catch (error) {
        socket.emit('error', error.message);
      }
    });

    // Place bid
    socket.on('place-bid', async ({ AuctionDetailId, amount }) => {
      try {
        const AuctionDetail = await AuctionDetail.findById(AuctionDetailId);
        if (!AuctionDetail) throw new Error('AuctionDetail not found');
        if (AuctionDetail.status !== 'active') throw new Error('AuctionDetail is not active');

        const team = await Team.findOne({ owner: socket.user._id });
        if (!team) throw new Error('Team not found');
        if (team.remainingBudget < amount) throw new Error('Insufficient budget');

        await AuctionDetail.placeBid(team._id, amount);
        
        // Broadcast updated AuctionDetail state
        io.to(AuctionDetailId).emit('AuctionDetail-state', await AuctionDetail.populate('currentHighestBidder'));
        
        // Extend AuctionDetail time
        clearTimeout(AuctionDetail.timeoutId);
        AuctionDetail.timeoutId = setTimeout(async () => {
          await AuctionDetail.complete();
          io.to(AuctionDetailId).emit('AuctionDetail-completed', AuctionDetail);
        }, 30000);
      } catch (error) {
        socket.emit('error', error.message);
      }
    });

    // Leave AuctionDetail room
    socket.on('leave-AuctionDetail', (AuctionDetailId) => {
      socket.leave(AuctionDetailId);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });
};