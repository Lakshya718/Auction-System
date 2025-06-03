import Team from '../models/Team.js';
import Auction from '../models/Auction.js';
import { isValidObjectId } from 'mongoose';

export const getTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('owner', 'name email')
      .sort({ name: 1 });
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(error.name === 'CastError' ? 400 : 500).json({ error: error.message });
  }
};

export const getTeam = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid team ID' });
    }

    const team = await Team.findById(id)
      .populate('owner', 'name email');

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Fetch players from auctions
    const auctions = await Auction.find({
      $or: [
        { 'players.soldTo': id },
        { 'retainedPlayers.team': id }
      ]
    }).populate('players.player retainedPlayers.player', 'playerName playerRole battingStyle bowlingStyle stats');

    const players = [
      ...auctions.flatMap(auction => auction.players
        .filter(p => p.soldTo?.toString() === id)
        .map(p => ({ ...p.player.toObject(), purchasePrice: p.soldPrice }))),
      ...auctions.flatMap(auction => auction.retainedPlayers
        .filter(r => r.team.toString() === id)
        .map(r => r.player))
    ];

    res.json({ ...team.toObject(), players });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(error.name === 'CastError' ? 400 : 500).json({ error: error.message });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid team ID' });
    }

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (req.user.role !== 'admin' && team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this team' });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'logo', 'bio'];
    const isValidUpdate = updates.every(update => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      return res.status(400).json({ error: 'Invalid fields for update' });
    }

    if (req.body.name) {
      const existingTeam = await Team.findOne({ name: req.body.name, _id: { $ne: id } });
      if (existingTeam) {
        return res.status(400).json({ error: 'Team name already exists' });
      }
    }

    updates.forEach(update => {
      team[update] = req.body[update];
    });

    await team.save();
    res.json(team);
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ error: error.message });
  }
};

export const getTeamPlayers = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid team ID' });
    }

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const auctions = await Auction.find({
      $or: [
        { 'players.soldTo': id },
        { 'retainedPlayers.team': id }
      ]
    }).populate({
      path: 'players.player retainedPlayers.player',
      select: 'playerName playerRole battingStyle bowlingStyle stats',
      options: { sort: { playerName: 1 } }
    });

    const players = [
      ...auctions.flatMap(auction => auction.players
        .filter(p => p.soldTo?.toString() === id)
        .map(p => ({ ...p.player.toObject(), purchasePrice: p.soldPrice }))),
      ...auctions.flatMap(auction => auction.retainedPlayers
        .filter(r => r.team.toString() === id)
        .map(r => r.player))
    ];

    res.json(players);
  } catch (error) {
    console.error('Error fetching team players:', error);
    res.status(error.name === 'CastError' ? 400 : 500).json({ error: error.message });
  }
};

export const getMyTeam = async (req, res) => {
  try {
    if (req.user.role !== 'team_owner') {
      return res.status(403).json({ error: 'Only team owners can access this endpoint' });
    }

    const team = await Team.findOne({ owner: req.user._id });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const auctions = await Auction.find({
      $or: [
        { 'players.soldTo': team._id },
        { 'retainedPlayers.team': team._id }
      ]
    }).populate('players.player retainedPlayers.player', 'playerName playerRole stats');

    const players = [
      ...auctions.flatMap(auction => auction.players
        .filter(p => p.soldTo?.toString() === team._id.toString())
        .map(p => ({ ...p.player.toObject(), purchasePrice: p.soldPrice }))),
      ...auctions.flatMap(auction => auction.retainedPlayers
        .filter(r => r.team.toString() === team._id.toString())
        .map(r => r.player))
    ];

    res.json({ ...team.toObject(), players });
  } catch (error) {
    console.error('Error fetching my team:', error);
    res.status(error.name === 'CastError' ? 400 : 500).json({ error: error.message });
  }
};