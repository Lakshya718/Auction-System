import RetainRequest from '../models/RetainRequest.js';
import Player from '../models/Player.js';
import Team from '../models/Team.js';
import Auction from '../models/Auction.js';
import { isValidObjectId } from 'mongoose';

export const createRetainRequest = async (req, res) => {
  try {
    const { player, team, auction, retainPrice } = req.body;

    if (!isValidObjectId(player) || !isValidObjectId(team) || !isValidObjectId(auction)) {
      return res.status(400).json({ error: 'Invalid player, team, or auction ID' });
    }

    if (retainPrice <= 0) {
      return res.status(400).json({ error: 'Retain price must be positive' });
    }

    const [playerExists, teamExists, auctionExists] = await Promise.all([
      Player.findById(player),
      Team.findById(team),
      Auction.findById(auction)
    ]);

    if (!playerExists || !teamExists || !auctionExists) {
      return res.status(400).json({ error: 'Player, team, or auction not found' });
    }

    if (req.user.role !== 'admin' && teamExists.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to create retain request for this team' });
    }

    const existingRequest = await RetainRequest.findOne({ player, team, auction });
    if (existingRequest) {
      return res.status(400).json({ error: 'Retain request already exists' });
    }

    const newRequest = new RetainRequest({ player, team, auction, retainPrice });
    await newRequest.save();

    res.status(201).json({
      success: true,
      message: 'Retain request submitted successfully',
      retainRequest: newRequest,
    });
  } catch (error) {
    console.error('Error creating retain request:', error);
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ error: error.message });
  }
};

export const getAllRetainRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && RetainRequest.schema.path('status').enumValues.includes(status)
      ? { status }
      : {};

    const retainRequests = await RetainRequest.find(filter)
      .populate('player', 'playerName')
      .populate('team', 'name')
      .populate('auction', 'tournamentName');

    res.status(200).json({ success: true, retainRequests });
  } catch (error) {
    console.error('Error fetching retain requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const reviewRetainRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid retain request ID' });
    }

    const retainRequest = await RetainRequest.findById(id);
    if (!retainRequest) {
      return res.status(404).json({ error: 'Retain request not found' });
    }

    const validStatuses = RetainRequest.schema.path('status').enumValues.filter(s => s !== 'pending');
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value, must be approved or rejected' });
    }

    retainRequest.status = status;
    await retainRequest.save();

    if (status === 'approved') {
      await Auction.updateOne(
        { _id: retainRequest.auction },
        {
          $push: {
            retainedPlayers: { player: retainRequest.player, team: retainRequest.team }
          }
        }
      );
    }

    res.status(200).json({
      success: true,
      message: `Retain request ${status}`,
      retainRequest,
    });
  } catch (error) {
    console.error('Error reviewing retain request:', error);
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ error: error.message });
  }
};