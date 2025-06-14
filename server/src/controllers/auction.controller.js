import Auction from '../models/Auction.js';
import Team from '../models/Team.js';
import Player from '../models/Player.js';
import { isValidObjectId } from 'mongoose';

export const createAuction = async (req, res) => {
  try {
    const {
      tournamentName,
      description,
      date,
      startTime,
      maxBudget,
      minBidIncrement,
      teams,
      players,
      retainedPlayers
    } = req.body;

    if (!tournamentName || !date || !startTime || !maxBudget || !teams || !players) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (maxBudget <= 0 || minBidIncrement <= 0) {
      return res.status(400).json({ error: 'Budget and bid increment must be positive' });
    }

    if (!/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/.test(startTime)) {
      return res.status(400).json({ error: 'Invalid start time format' });
    }

    const invalidIds = teams.concat(players, retainedPlayers?.map(r => r.player) || [])
      .filter(id => !isValidObjectId(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ error: 'Invalid team or player IDs' });
    }

    const [teamsExist, playersExist] = await Promise.all([
      Team.find({ _id: { $in: teams } }).countDocuments(),
      Player.find({ _id: { $in: players } }).countDocuments()
    ]);

    if (teamsExist !== teams.length || playersExist !== players.length) {
      return res.status(400).json({ error: 'Some teams or players not found' });
    }

    const formattedPlayers = players.map(playerId => ({
      player: playerId,
      status: 'available',
      currentBid: 0
    }));

    const formattedRetainedPlayers = retainedPlayers?.map(({ player, team }) => {
      if (!isValidObjectId(team) || !teams.includes(team)) {
        throw new Error('Invalid or unauthorized team in retained players');
      }
      return { player, team };
    }) || [];

    const newAuction = new Auction({
      tournamentName,
      description,
      date,
      startTime,
      maxBudget,
      minBidIncrement: minBidIncrement || 500000,
      teams,
      players: formattedPlayers,
      retainedPlayers: formattedRetainedPlayers,
      teamBudgets: teams.map(teamId => ({ team: teamId, remainingBudget: maxBudget }))
    });

    await newAuction.save();

    res.status(201).json({
      success: true,
      message: 'Auction created successfully',
      auction: newAuction
    });
  } catch (error) {
    console.error('Error creating auction:', error);
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ error: error.message });
  }
};

export const getAllAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find()
      .populate('teams', 'name')
      .populate('players.player', 'playerName')
      .populate('retainedPlayers.player', 'playerName')
      .populate('retainedPlayers.team', 'name');
    res.status(200).json({ success: true, auctions });
  } catch (error) {
    console.error('Error fetching auctions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAuctionById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid auction ID' });
    }

    const auction = await Auction.findById(id)
      .populate('teams', 'name')
      .populate('players.player', 'playerName basePrice playerRole')
      .populate('retainedPlayers.player', 'playerName basePrice playerRole')
      .populate('retainedPlayers.team', 'name');

    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    res.status(200).json({ success: true, auction });
  } catch (error) {
    console.error('Error fetching auction:', error);
    res.status(error.name === 'CastError' ? 400 : 500).json({ error: error.message });
  }
};

export const updateAuctionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid auction ID' });
    }

    const validStatuses = Auction.schema.path('status').enumValues;
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const auction = await Auction.findById(id);
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    auction.status = status;
    await auction.save();

    const io = req.app.get('io');
    if (io && status === 'active') {
      io.to(auction._id.toString()).emit('auction-started', {
        auctionId: auction._id,
        message: 'Auction has started!'
      });
    } else if (io && status === 'completed') {
      io.to(auction._id.toString()).emit('auction-completed', {
        auctionId: auction._id,
        message: 'Auction has completed!'
      });
    }

    res.status(200).json({ success: true, message: 'Auction status updated', auction });
  } catch (error) {
    console.error('Error updating auction status:', error);
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ error: error.message });
  }
};