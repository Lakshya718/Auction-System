import mongoose from "mongoose";

// --------- CRICKET SPECIFIC SCHEMAS --------- //
const cricketScorecardSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    required: true,
  },
  runs: { type: Number, default: 0 },
  ballsFaced: { type: Number, default: 0 },
  fours: { type: Number, default: 0 },
  sixes: { type: Number, default: 0 },
  wicketsTaken: { type: Number, default: 0 },
  oversBowled: { type: Number, default: 0 },
  runsConceded: { type: Number, default: 0 },
  catches: { type: Number, default: 0 },
  runOuts: { type: Number, default: 0 },
  stumpings: { type: Number, default: 0 },
});

const cricketTeamStatsSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  score: { type: Number, default: 0 },
  overs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  extras: {
    wides: { type: Number, default: 0 },
    noBalls: { type: Number, default: 0 },
    byes: { type: Number, default: 0 },
    legByes: { type: Number, default: 0 },
    penaltyRuns: { type: Number, default: 0 },
  },
});

// --------- FOOTBALL SPECIFIC SCHEMAS --------- //
const footballScorecardSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    required: true,
  },
  goals: { type: Number, default: 0 },
  assists: { type: Number, default: 0 },
  shotsOnTarget: { type: Number, default: 0 },
  passesCompleted: { type: Number, default: 0 },
  tackles: { type: Number, default: 0 },
  saves: { type: Number, default: 0 },
  yellowCards: { type: Number, default: 0 },
  redCards: { type: Number, default: 0 },
});

const footballTeamStatsSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  goals: { type: Number, default: 0 },
  possession: { type: Number, default: 0 }, // percentage
  corners: { type: Number, default: 0 },
  fouls: { type: Number, default: 0 },
  shotsOnTarget: { type: Number, default: 0 },
  shotsOffTarget: { type: Number, default: 0 },
});

// --------- BASKETBALL SPECIFIC SCHEMAS --------- //
const basketballScorecardSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    required: true,
  },
  points: { type: Number, default: 0 },
  twoPointers: { type: Number, default: 0 },
  threePointers: { type: Number, default: 0 },
  freeThrows: { type: Number, default: 0 },
  rebounds: { type: Number, default: 0 },
  assists: { type: Number, default: 0 },
  steals: { type: Number, default: 0 },
  blocks: { type: Number, default: 0 },
  turnovers: { type: Number, default: 0 },
  fouls: { type: Number, default: 0 },
});

const basketballTeamStatsSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  points: { type: Number, default: 0 },
  fieldGoalPercentage: { type: Number, default: 0 },
  threePointPercentage: { type: Number, default: 0 },
  freeThrowPercentage: { type: Number, default: 0 },
  rebounds: { type: Number, default: 0 },
  assists: { type: Number, default: 0 },
  steals: { type: Number, default: 0 },
  blocks: { type: Number, default: 0 },
  turnovers: { type: Number, default: 0 },
  fouls: { type: Number, default: 0 },
});

// --------- VOLLEYBALL SPECIFIC SCHEMAS --------- //
const volleyballScorecardSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    required: true,
  },
  points: { type: Number, default: 0 },
  aces: { type: Number, default: 0 },
  kills: { type: Number, default: 0 },
  blocks: { type: Number, default: 0 },
  digs: { type: Number, default: 0 },
  assists: { type: Number, default: 0 },
  errorCount: { type: Number, default: 0 },
});

const volleyballTeamStatsSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  sets: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  aces: { type: Number, default: 0 },
  kills: { type: Number, default: 0 },
  blocks: { type: Number, default: 0 },
  digs: { type: Number, default: 0 },
  assists: { type: Number, default: 0 },
  errorCount: { type: Number, default: 0 },
});

// --------- KABADDI SPECIFIC SCHEMAS --------- //
const kabaddiScorecardSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    required: true,
  },
  raidPoints: { type: Number, default: 0 },
  tacklePoints: { type: Number, default: 0 },
  bonusPoints: { type: Number, default: 0 },
  superRaids: { type: Number, default: 0 },
  superTackles: { type: Number, default: 0 },
  highFives: { type: Number, default: 0 },
  allOuts: { type: Number, default: 0 },
});

const kabaddiTeamStatsSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  totalPoints: { type: Number, default: 0 },
  raidPoints: { type: Number, default: 0 },
  tacklePoints: { type: Number, default: 0 },
  allOutPoints: { type: Number, default: 0 },
  bonusPoints: { type: Number, default: 0 },
  defensePoints: { type: Number, default: 0 },
});

// --------- COMMON SCHEMAS --------- //
const commentarySchema = new mongoose.Schema({
  timeStamp: { type: Number, required: true }, // Time in seconds or game-specific notation (over number, etc.)
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const highlightSchema = new mongoose.Schema({
  description: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const matchSchema = new mongoose.Schema(
  {
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
      required: true,
    },
    team1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    team2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    sport: {
      type: String,
      enum: ["cricket", "football", "basketball", "volleyball", "kabaddi"],
      required: true,
      default: "cricket",
    },
    matchDate: { type: Date, required: true },
    venue: { type: String, required: true },
    matchStatus: {
      type: String,
      enum: ["upcoming", "in-progress", "completed", "cancelled"],
      default: "upcoming",
    },
    matchResult: {
      type: String,
      enum: ["team1", "team2", "tie", "no-result", null],
      default: null,
    },
    tossWinner: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    electedTo: {
      type: String,
      enum: ["bat", "bowl", "kick-off", "receive", null],
      default: null,
    },
    playerOfTheMatch: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },

    // Sport-specific scorecards
    cricketScorecard: [cricketScorecardSchema],
    footballScorecard: [footballScorecardSchema],
    basketballScorecard: [basketballScorecardSchema],
    volleyballScorecard: [volleyballScorecardSchema],
    kabaddiScorecard: [kabaddiScorecardSchema],

    // Sport-specific team stats
    cricketTeamStats: [cricketTeamStatsSchema],
    footballTeamStats: [footballTeamStatsSchema],
    basketballTeamStats: [basketballTeamStatsSchema],
    volleyballTeamStats: [volleyballTeamStatsSchema],
    kabaddiTeamStats: [kabaddiTeamStatsSchema],

    commentary: [commentarySchema],
    highlights: [highlightSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Match", matchSchema);
