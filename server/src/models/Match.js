import mongoose from 'mongoose';

const scorecardSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  runs: { type: Number, default: 0 },
  ballsFaced: { type: Number, default: 0 },
  fours: { type: Number, default: 0 },
  sixes: { type: Number, default: 0 },
  wicketsTaken: { type: Number, default: 0 },
  oversBowled: { type: Number, default: 0 },
  runsConceded: { type: Number, default: 0 },
  catches: { type: Number, default: 0 },
  runOuts: { type: Number, default: 0 },
  stumpings: { type: Number, default: 0 }
});

const teamStatsSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  score: { type: Number, default: 0 },
  overs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  extras: {
    wides: { type: Number, default: 0 },
    noBalls: { type: Number, default: 0 },
    byes: { type: Number, default: 0 },
    legByes: { type: Number, default: 0 },
    penaltyRuns: { type: Number, default: 0 }
  }
});

const commentarySchema = new mongoose.Schema({
  ballNumber: { type: Number, required: true },
  overNumber: { type: Number, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const highlightSchema = new mongoose.Schema({
  description: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const matchSchema = new mongoose.Schema({
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', required: true },
  team1: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  team2: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  matchDate: { type: Date, required: true },
  venue: { type: String, required: true },
  matchStatus: {
    type: String,
    enum: ['upcoming', 'in-progress', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  matchResult: {
    type: String,
    enum: ['team1', 'team2', 'tie', 'no-result', null],
    default: null
  },
  tossWinner: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  electedTo: { type: String, enum: ['bat', 'bowl', null], default: null },
  manOfTheMatch: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  scorecard: [scorecardSchema],
  teamStats: [teamStatsSchema],
  commentary: [commentarySchema],
  highlights: [highlightSchema]
}, { timestamps: true });

export default mongoose.model('Match', matchSchema);