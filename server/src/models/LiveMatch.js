import mongoose from "mongoose";

const playerStatsSchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    required: false,
  },
  playerName: { type: String, required: true },
  runs: { type: Number, default: 0 },
  ballsFaced: { type: Number, default: 0 },
  fours: { type: Number, default: 0 },
  sixes: { type: Number, default: 0 },
  strikeRate: { type: Number, default: 0 },
  isOut: { type: Boolean, default: false },
  dismissalType: {
    type: String,
    enum: [
      "bowled",
      "caught",
      "lbw",
      "run_out",
      "stumped",
      "hit_wicket",
      "not_out",
    ],
    default: "not_out",
  },
  dismissedBy: { type: String, default: "" }, // bowler or fielder name
  overNumber: { type: Number, default: 0 }, // over in which dismissed
  ballNumber: { type: Number, default: 0 }, // ball in over when dismissed
});

const bowlerStatsSchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    required: false,
  },
  playerName: { type: String, required: true },
  oversBowled: { type: Number, default: 0 },
  ballsBowled: { type: Number, default: 0 },
  runsConceded: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  maidens: { type: Number, default: 0 },
  economy: { type: Number, default: 0 },
  wides: { type: Number, default: 0 },
  noBalls: { type: Number, default: 0 },
});

const ballSchema = new mongoose.Schema({
  overNumber: { type: Number, required: true },
  ballNumber: { type: Number, required: true }, // 1-6 (or more for extras)
  batsman: { type: String, required: true },
  bowler: { type: String, required: true },
  runs: { type: Number, default: 0 },
  isWicket: { type: Boolean, default: false },
  wicketType: {
    type: String,
    enum: ["bowled", "caught", "lbw", "run_out", "stumped", "hit_wicket", ""],
    default: "",
  },
  dismissedPlayer: { type: String, default: "" },
  dismissedBy: { type: String, default: "" }, // fielder/keeper name for catches
  isExtra: { type: Boolean, default: false },
  extraType: {
    type: String,
    enum: ["wide", "no_ball", "bye", "leg_bye", ""],
    default: "",
  },
  extraRuns: { type: Number, default: 0 },
  commentary: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now },
});

const overSchema = new mongoose.Schema({
  overNumber: { type: Number, required: true },
  bowler: { type: String, required: true },
  balls: [ballSchema],
  runsScored: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
});

const inningsSchema = new mongoose.Schema({
  inningsNumber: { type: Number, required: true }, // 1 or 2
  battingTeam: { type: String, required: true },
  bowlingTeam: { type: String, required: true },
  totalRuns: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  overs: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  runRate: { type: Number, default: 0 },
  currentBatsmen: {
    striker: { type: String, default: "" },
    nonStriker: { type: String, default: "" },
  },
  currentBowler: { type: String, default: "" },
  batsmenStats: [playerStatsSchema],
  bowlerStats: [bowlerStatsSchema],
  oversData: [overSchema],
  isCompleted: { type: Boolean, default: false },
  target: { type: Number, default: 0 }, // for second innings
  requiredRunRate: { type: Number, default: 0 },
});

const liveMatchSchema = new mongoose.Schema({
  matchTitle: { type: String, required: true },
  team1: { type: String, required: true },
  team2: { type: String, required: true },
  totalOvers: { type: Number, required: true },
  tossWinner: { type: String, required: true },
  tossDecision: {
    type: String,
    enum: ["bat", "bowl"],
    required: true,
  },
  venue: { type: String, default: "" },

  // Match status
  status: {
    type: String,
    enum: ["upcoming", "live", "completed", "abandoned"],
    default: "upcoming",
  },
  currentInnings: { type: Number, default: 1 },

  // Teams and Players
  team1Players: [
    {
      playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
      playerName: { type: String, required: true },
      role: {
        type: String,
        enum: ["batsman", "bowler", "all-rounder", "wicket-keeper"],
        default: "batsman",
      },
    },
  ],
  team2Players: [
    {
      playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
      playerName: { type: String, required: true },
      role: {
        type: String,
        enum: ["batsman", "bowler", "all-rounder", "wicket-keeper"],
        default: "batsman",
      },
    },
  ],

  // Innings data
  innings: [inningsSchema],

  // Match result
  result: {
    winner: { type: String, default: "" },
    margin: { type: String, default: "" }, // "by 5 wickets", "by 20 runs"
    playerOfTheMatch: { type: String, default: "" },
  },

  // Admin control
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  startTime: { type: Date },
  endTime: { type: Date },
});

// Methods
liveMatchSchema.methods.getCurrentInnings = function () {
  return this.innings.find((inn) => inn.inningsNumber === this.currentInnings);
};

liveMatchSchema.methods.addBall = function (ballData) {
  const currentInnings = this.getCurrentInnings();
  if (!currentInnings) return false;

  const currentOver = currentInnings.oversData.find(
    (over) => over.overNumber === ballData.overNumber && !over.isCompleted
  );

  if (currentOver) {
    currentOver.balls.push(ballData);
    currentOver.runsScored += ballData.runs + (ballData.extraRuns || 0);
    if (ballData.isWicket) currentOver.wickets += 1;

    // Complete over if 6 legal balls
    const legalBalls = currentOver.balls.filter(
      (ball) =>
        !ball.isExtra ||
        ball.extraType === "bye" ||
        ball.extraType === "leg_bye"
    );
    if (legalBalls.length >= 6) {
      currentOver.isCompleted = true;
    }
  }

  return true;
};

liveMatchSchema.methods.updatePlayerStats = function (ballData) {
  const currentInnings = this.getCurrentInnings();
  if (!currentInnings) return false;

  // Update batsman stats
  let batsman = currentInnings.batsmenStats.find(
    (b) => b.playerName === ballData.batsman
  );
  if (batsman) {
    if (
      !ballData.isExtra ||
      ballData.extraType === "bye" ||
      ballData.extraType === "leg_bye"
    ) {
      batsman.ballsFaced += 1;
    }
    batsman.runs += ballData.runs;
    if (ballData.runs === 4) batsman.fours += 1;
    if (ballData.runs === 6) batsman.sixes += 1;
    batsman.strikeRate =
      batsman.ballsFaced > 0
        ? ((batsman.runs / batsman.ballsFaced) * 100).toFixed(2)
        : 0;

    if (ballData.isWicket && ballData.dismissedPlayer === ballData.batsman) {
      batsman.isOut = true;
      batsman.dismissalType = ballData.wicketType;
      batsman.dismissedBy = ballData.dismissedBy;
      batsman.overNumber = ballData.overNumber;
      batsman.ballNumber = ballData.ballNumber;
    }
  }

  // Update bowler stats
  let bowler = currentInnings.bowlerStats.find(
    (b) => b.playerName === ballData.bowler
  );
  if (bowler) {
    if (!ballData.isExtra || ballData.extraType === "no_ball") {
      bowler.ballsBowled += 1;
    }
    bowler.oversBowled =
      Math.floor(bowler.ballsBowled / 6) + (bowler.ballsBowled % 6) / 10;
    bowler.runsConceded += ballData.runs + (ballData.extraRuns || 0);
    if (ballData.isWicket) bowler.wickets += 1;
    if (ballData.extraType === "wide") bowler.wides += 1;
    if (ballData.extraType === "no_ball") bowler.noBalls += 1;

    const overs = bowler.oversBowled || 0.1;
    bowler.economy = (bowler.runsConceded / overs).toFixed(2);
  }

  return true;
};

export default mongoose.model("LiveMatch", liveMatchSchema);
