import Match from '../models/Match.js';
import Team from '../models/Team.js';
import Player from '../models/Player.js';
import Auction from '../models/Auction.js';
import { isValidObjectId } from 'mongoose';

export const createMatch = async (req, res) => {
  try {
    const { tournament, team1, team2, matchDate, venue } = req.body;

    if (!isValidObjectId(tournament) || !isValidObjectId(team1) || !isValidObjectId(team2)) {
      return res.status(400).json({ error: 'Invalid auction or team IDs' });
    }

    if (team1 === team2) {
      return res.status(400).json({ error: 'Teams cannot be the same' });
    }

    const [auctionExists, team1Exists, team2Exists] = await Promise.all([
      Auction.findById(tournament),
      Team.findById(team1),
      Team.findById(team2)
    ]);

    if (!auctionExists || !team1Exists || !team2Exists) {
      return res.status(400).json({ error: 'Auction or teams not found' });
    }

    if (new Date(matchDate) < new Date()) {
      return res.status(400).json({ error: 'Match date cannot be in the past' });
    }

    const match = new Match({ tournament, team1, team2, matchDate, venue: venue || 'TBD' });
    await match.save();

    res.status(201).json({ success: true, message: 'Match created successfully', match });
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ error: error.message });
  }
};

export const getMatch = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid match ID' });
    }

    const match = await Match.findById(id)
      .populate('team1 team2', 'name logo')
      .populate('scorecard.player', 'playerName')
      .populate('tournament', 'tournamentName')
      .populate('tossWinner', 'name')
      .populate('manOfTheMatch', 'playerName');

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.status(200).json({ success: true, match });
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(error.name === 'CastError' ? 400 : 500).json({ error: error.message });
  }
};

export const updateMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { matchStatus, matchResult, tossWinner, electedTo, manOfTheMatch, scorecard, teamStats } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid match ID' });
    }

    const match = await Match.findById(id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const updates = { matchStatus, matchResult, tossWinner, electedTo, manOfTheMatch, scorecard, teamStats };
    const allowedUpdates = ['matchStatus', 'matchResult', 'tossWinner', 'electedTo', 'manOfTheMatch', 'scorecard', 'teamStats'];
    const isValidUpdate = Object.keys(updates).every(key => allowedUpdates.includes(key) && updates[key] !== undefined);

    if (!isValidUpdate) {
      return res.status(400).json({ error: 'Invalid fields for update' });
    }

    if (matchStatus && !Match.schema.path('matchStatus').enumValues.includes(matchStatus)) {
      return res.status(400).json({ error: 'Invalid match status' });
    }

    if (matchResult && !Match.schema.path('matchResult').enumValues.includes(matchResult)) {
      return res.status(400).json({ error: 'Invalid match result' });
    }

    if (tossWinner && !isValidObjectId(tossWinner)) {
      return res.status(400).json({ error: 'Invalid toss winner ID' });
    }

    if (electedTo && !Match.schema.path('electedTo').enumValues.includes(electedTo)) {
      return res.status(400).json({ error: 'Invalid electedTo value' });
    }

    if (manOfTheMatch && !isValidObjectId(manOfTheMatch)) {
      return res.status(400).json({ error: 'Invalid man of the match ID' });
    }

    if (scorecard) {
      for (const entry of scorecard) {
        if (!isValidObjectId(entry.player)) {
          return res.status(400).json({ error: 'Invalid player ID in scorecard' });
        }
        await Player.updateOne(
          { _id: entry.player },
          {
            $inc: {
              'stats.matches': 1,
              'stats.runs': entry.runs || 0,
              'stats.wickets': entry.wicketsTaken || 0
            }
          }
        );
      }
    }

    Object.assign(match, updates);
    await match.save();

    const io = req.app.get('io');
    if (io && matchStatus) {
      io.to(match.tournament.toString()).emit(`match-${matchStatus}`, {
        matchId: match._id,
        message: `Match ${matchStatus}`,
        match
      });
    }

    res.status(200).json({ success: true, message: 'Match updated successfully', match });
  } catch (error) {
    console.error('Error updating match:', error);
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ error: error.message });
  }
};

export const getMatchesByTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    if (!isValidObjectId(tournamentId)) {
      return res.status(400).json({ error: 'Invalid auction ID' });
    }

    const matches = await Match.find({ tournament: tournamentId })
      .populate('team1 team2', 'name logo')
      .sort({ matchDate: 1 });

    res.status(200).json({ success: true, matches });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(error.name === 'CastError' ? 400 : 500).json({ error: error.message });
  }
};