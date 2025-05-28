import Team from '../models/Team.js';
import User from '../models/User.js';

export const getTeams = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) {
      filter.teamName = { $regex: search, $options: 'i' };
    }
    const teams = await Team.find(filter)
      .populate('owner', 'name email')
      .populate('players', 'name type status purchasePrice')
      .sort({ teamName: 1 });
    console.log(`Fetched ${teams.length} teams from database`);
    res.json(teams);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('players', 'name type status purchasePrice stats');

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateTeam = async (req, res) => {
  try {
    // Only allow team owner or admin to update
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (req.user.role !== 'admin' && team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this team' });
    }

    // Update allowed fields
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'logo', 'description'];
    
    updates.forEach(update => {
      if (allowedUpdates.includes(update)) {
        team[update] = req.body[update];
      }
    });

    await team.save();
    res.json(team);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getTeamPlayers = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate({
        path: 'players',
        select: 'name type battingStyle bowlingStyle stats purchasePrice',
        options: { sort: { name: 1 } }
      });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json(team.players);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getMyTeam = async (req, res) => {
  try {
    if (req.user.role !== 'team_owner') {
      return res.status(403).json({ error: 'Only team owners can access this endpoint' });
    }

    const team = await Team.findOne({ owner: req.user._id })
      .populate('players', 'name type status purchasePrice stats');

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};