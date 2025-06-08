import Player from '../models/Player.js';
import Team from '../models/Team.js';
import Auction from '../models/Auction.js';

// Controller to get live bidding data for admin
export const getLiveBiddingData = async (req, res) => {
  try {
    // Fetch players with required fields
    const players = await Player.find({}, 'profilePhoto name basePrice').lean();

    // Fetch teams with required fields
    const teams = await Team.find({}, 'name photo purseRemaining').lean();

    // For simplicity, get current bidding status for the first active auction
    const auction = await Auction.findOne({ status: 'active' }).lean();

    let currentBidding = null;
    if (auction && auction.players && auction.players.length > 0) {
      // Find the player currently being bid on (for demo, pick first player)
      const player = auction.players[0];
      currentBidding = {
        playerId: player.player,
        profilePhoto: player.profilePhoto || '',
        name: player.name || '',
        basePrice: player.basePrice || 0,
        currentBidTeam: player.currentHighestBidder || null,
        currentBidPrice: player.currentBid || 0
      };
    }

    res.json({
      players,
      teams,
      currentBidding
    });
  } catch (error) {
    console.error('Error fetching live bidding data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
