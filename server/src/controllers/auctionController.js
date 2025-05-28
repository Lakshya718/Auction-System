import mongoose from 'mongoose';
import AuctionDetail from '../models/AuctionDetail.js';
import Auction from '../models/Auction.js';
import Player from '../models/Player.js';
import Team from '../models/Team.js';

export const createAuction = async (req, res) => {
  try {
    const {auctionName, auctionDescription, auctionDate, auctionStartTime, playerBasePrice, teamTotalBudget} = req.body;
    const existingAuction = await Auction.findOne({auctionName: auctionName});
    if(existingAuction){
      return res.status(400).json({
        error: "auction name is not invalid or not available",
      });
    }
    const auction = new Auction({auctionName, auctionDescription, auctionDate, auctionStartTime, playerBasePrice, teamTotalBudget});
    await auction.save();

    return res.status(201).json({
      auction: auction,
      success: true,
      message: "auction created successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      error: "internal server error",
    });
  }
}

export const createAuctionDetail = async (req, res) => {
  try {
    const { playerId } = req.body;
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    if (player.status !== 'available') {
      return res.status(400).json({ error: 'Player is not available for AuctionDetail' });
    }

    // Check if player is already in an active AuctionDetail
    const existingAuctionDetail = await AuctionDetail.findOne({
      player: playerId,
      status: { $in: ['pending', 'active'] }
    });
    if (existingAuctionDetail) {
      return res.status(400).json({ error: 'Player is already in an AuctionDetail' });
    }

    const AuctionDetail = new AuctionDetail({
      player: playerId,
      currentBid: player.basePrice
    });
    await AuctionDetail.save();

    res.status(201).json(AuctionDetail);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAuctionDetails = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;

    const AuctionDetails = await AuctionDetail.find(filters)
      .populate('player')
      .populate('currentHighestBidder', 'name logo')
      .populate('winningBid.team', 'name logo')
      .sort({ createdAt: -1 });

    res.json(AuctionDetails);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find()
      .populate('participatingTeams', 'teamName')
      .sort({ auctionDate: -1 });
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch auctions' });
  }
};

export const getAuctionDetail = async (req, res) => {
  try {
    const AuctionDetail = await AuctionDetail.findById(req.params.id)
      .populate('player')
      .populate('currentHighestBidder', 'name logo')
      .populate('winningBid.team', 'name logo')
      .populate({
        path: 'biddingHistory',
        populate: { path: 'team', select: 'name logo' }
      });

    if (!AuctionDetail) {
      return res.status(404).json({ error: 'AuctionDetail not found' });
    }

    res.json(AuctionDetail);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const startAuctionDetail = async (req, res) => {
  try {
    const AuctionDetail = await AuctionDetail.findById(req.params.id);
    if (!AuctionDetail) {
      return res.status(404).json({ error: 'AuctionDetail not found' });
    }

    if (AuctionDetail.status !== 'pending') {
      return res.status(400).json({ error: 'AuctionDetail cannot be started' });
    }

    AuctionDetail.status = 'active';
    AuctionDetail.startTime = new Date();
    AuctionDetail.endTime = new Date(Date.now() + 30000); // 30 seconds initial time
    await AuctionDetail.save();

    // Set timeout to complete AuctionDetail if no bids
    AuctionDetail.timeoutId = setTimeout(async () => {
      await AuctionDetail.complete();
      // Socket event will be emitted by the socket handler
    }, 30000);

    res.json(AuctionDetail);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const cancelAuctionDetail = async (req, res) => {
  try {
    const AuctionDetail = await AuctionDetail.findById(req.params.id);
    if (!AuctionDetail) {
      return res.status(404).json({ error: 'AuctionDetail not found' });
    }

    if (!['pending', 'active'].includes(AuctionDetail.status)) {
      return res.status(400).json({ error: 'AuctionDetail cannot be cancelled' });
    }

    AuctionDetail.status = 'cancelled';
    await AuctionDetail.save();

    // Update player status
    const player = await Player.findById(AuctionDetail.player);
    player.status = 'available';
    await player.save();

    res.json(AuctionDetail);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const removeTeamFromAuction = async (req, res) => {
  try {
    const { auctionId, teamId } = req.params;
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    // Check if team is in participatingTeams
    const teamIndex = auction.participatingTeams.findIndex(t => t.toString() === teamId);
    if (teamIndex === -1) {
      return res.status(404).json({ error: 'Team not found in this auction' });
    }

    // Remove team from participatingTeams
    auction.participatingTeams.splice(teamIndex, 1);
    await auction.save();

    res.json({ success: true, message: 'Team removed from auction successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const registerTeamToAuction = async (req, res) => {
  try {
    const auctionId = req.params.id;
    const user = req.user;

    console.log("Registering team to auction. User:", user);
    console.log("User team:", user.team);

    if (!user || !user.team) {
      return res.status(400).json({ error: 'User team information missing' });
    }

    const auction = await Auction.findById(auctionId);

    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    // Check if team is already registered
    const isRegistered = auction.participatingTeams.some(
      (teamId) => teamId.toString() === user.team.toString()
    );

    if (isRegistered) {
      return res.status(400).json({ error: 'Team already registered in this auction' });
    }

    // Add team to participatingTeams
    auction.participatingTeams.push(user.team);
    await auction.save();

    return res.json({ message: 'Team registered successfully' });
  } catch (error) {
    console.error('Error registering team to auction:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
