import LiveMatch from "../models/LiveMatch.js";
import { getIoInstance } from "../utils/socketInstance.js";

// Create a new live match
const createLiveMatch = async (req, res) => {
  try {
    const {
      matchTitle,
      team1,
      team2,
      totalOvers,
      tossWinner,
      tossDecision,
      venue,
      team1Players,
      team2Players,
    } = req.body;

    const liveMatch = new LiveMatch({
      matchTitle,
      team1,
      team2,
      totalOvers,
      tossWinner,
      tossDecision,
      venue,
      team1Players,
      team2Players,
      createdBy: req.user.id,
      status: "upcoming",
    });

    // Initialize innings based on toss decision
    const battingFirst =
      tossDecision === "bat"
        ? tossWinner
        : tossWinner === team1
        ? team2
        : team1;
    const bowlingFirst =
      tossDecision === "bat"
        ? tossWinner === team1
          ? team2
          : team1
        : tossWinner;

    liveMatch.innings = [
      {
        inningsNumber: 1,
        battingTeam: battingFirst,
        bowlingTeam: bowlingFirst,
        batsmenStats: [],
        bowlerStats: [],
        oversData: [],
      },
      {
        inningsNumber: 2,
        battingTeam: bowlingFirst,
        bowlingTeam: battingFirst,
        batsmenStats: [],
        bowlerStats: [],
        oversData: [],
      },
    ];

    await liveMatch.save();
    res.status(201).json({ success: true, match: liveMatch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Start the match with opening batsmen and bowler
const startMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { striker, nonStriker, openingBowler } = req.body;

    const match = await LiveMatch.findById(matchId);
    if (!match) {
      return res
        .status(404)
        .json({ success: false, message: "Match not found" });
    }

    // Find player IDs from team rosters (if they exist)
    const allPlayers = [...match.team1Players, ...match.team2Players];

    const strikerPlayer = allPlayers.find((p) => p.playerName === striker);
    const nonStrikerPlayer = allPlayers.find(
      (p) => p.playerName === nonStriker
    );
    const bowlerPlayer = allPlayers.find((p) => p.playerName === openingBowler);

    if (!strikerPlayer || !nonStrikerPlayer || !bowlerPlayer) {
      return res.status(400).json({
        success: false,
        message: "One or more players not found in team rosters",
      });
    }

    // Update match status and set opening players
    match.status = "live";
    match.startTime = new Date();

    const firstInnings = match.innings[0];
    firstInnings.currentBatsmen.striker = striker;
    firstInnings.currentBatsmen.nonStriker = nonStriker;
    firstInnings.currentBowler = openingBowler;

    // Initialize batsmen stats
    firstInnings.batsmenStats.push({
      playerId: strikerPlayer.playerId || null,
      playerName: striker,
      runs: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      strikeRate: 0,
      isOut: false,
    });
    firstInnings.batsmenStats.push({
      playerId: nonStrikerPlayer.playerId || null,
      playerName: nonStriker,
      runs: 0,
      ballsFaced: 0,
      fours: 0,
      sixes: 0,
      strikeRate: 0,
      isOut: false,
    });

    // Initialize opening bowler stats
    firstInnings.bowlerStats.push({
      playerId: bowlerPlayer.playerId || null,
      playerName: openingBowler,
      oversBowled: 0,
      ballsBowled: 0,
      runsConceded: 0,
      wickets: 0,
      maidens: 0,
      economy: 0,
      wides: 0,
      noBalls: 0,
    });

    // Create first over
    firstInnings.oversData.push({
      overNumber: 1,
      bowler: openingBowler,
      balls: [],
      runsScored: 0,
      wickets: 0,
      isCompleted: false,
    });

    await match.save();

    // Emit match start event
    const io = getIoInstance();
    io.emit("matchStarted", { matchId, match });

    res.json({ success: true, match });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Record a ball
const recordBall = async (req, res) => {
  try {
    const { matchId } = req.params;
    const ballData = req.body;

    const match = await LiveMatch.findById(matchId);
    if (!match) {
      return res
        .status(404)
        .json({ success: false, message: "Match not found" });
    }

    const currentInnings = match.getCurrentInnings();
    if (!currentInnings) {
      return res
        .status(400)
        .json({ success: false, message: "No active innings" });
    }

    // Get the current over before adding the ball
    const currentOver = currentInnings.oversData.find(
      (over) => over.overNumber === ballData.overNumber && !over.isCompleted
    );

    // Add ball to the current over
    match.addBall(ballData);

    // Update player statistics
    match.updatePlayerStats(ballData);

    // Update innings totals
    currentInnings.totalRuns += ballData.runs + (ballData.extraRuns || 0);
    if (ballData.isWicket) {
      currentInnings.wickets += 1;
    }

    // Update balls and overs count (only for legal deliveries)
    if (
      !ballData.isExtra ||
      ballData.extraType === "bye" ||
      ballData.extraType === "leg_bye"
    ) {
      currentInnings.balls += 1;
      currentInnings.overs =
        Math.floor(currentInnings.balls / 6) + (currentInnings.balls % 6) / 10;
    }

    // Calculate run rate
    const oversCompleted = currentInnings.overs || 0.1;
    currentInnings.runRate = (
      currentInnings.totalRuns / oversCompleted
    ).toFixed(2);

    // If second innings, calculate required run rate
    if (currentInnings.inningsNumber === 2) {
      const target = match.innings[0].totalRuns + 1;
      currentInnings.target = target;
      const runsNeeded = target - currentInnings.totalRuns;
      const oversRemaining = match.totalOvers - oversCompleted;
      if (oversRemaining > 0) {
        currentInnings.requiredRunRate = (runsNeeded / oversRemaining).toFixed(
          2
        );
      }
    }

    // STRIKER ROTATION LOGIC:
    // 1. After odd runs (1, 3, 5) during the over - batsmen swap ends
    // 2. After over completion (6th legal ball) - batsmen always swap ends
    // Note: If the last ball of an over is an odd run, batsmen swap twice and end up back at original ends

    // Check if batsmen need to swap ends (odd runs during the over)
    if (!ballData.isWicket && ballData.runs % 2 === 1) {
      const temp = currentInnings.currentBatsmen.striker;
      currentInnings.currentBatsmen.striker =
        currentInnings.currentBatsmen.nonStriker;
      currentInnings.currentBatsmen.nonStriker = temp;
    }

    // Check if over is completed after adding the ball and swap ends
    if (currentOver && currentOver.isCompleted) {
      // Swap ends after over completion (happens regardless of runs on last ball)
      const temp = currentInnings.currentBatsmen.striker;
      currentInnings.currentBatsmen.striker =
        currentInnings.currentBatsmen.nonStriker;
      currentInnings.currentBatsmen.nonStriker = temp;
    }

    // Check if innings is completed
    if (
      currentInnings.wickets >= 10 ||
      currentInnings.overs >= match.totalOvers
    ) {
      currentInnings.isCompleted = true;

      if (currentInnings.inningsNumber === 1) {
        match.currentInnings = 2;
      } else {
        match.status = "completed";
        match.endTime = new Date();

        // Determine winner
        const firstInnings = match.innings[0];
        const secondInnings = match.innings[1];

        if (secondInnings.totalRuns > firstInnings.totalRuns) {
          match.result.winner = secondInnings.battingTeam;
          match.result.margin = `by ${10 - secondInnings.wickets} wickets`;
        } else if (firstInnings.totalRuns > secondInnings.totalRuns) {
          match.result.winner = firstInnings.battingTeam;
          match.result.margin = `by ${
            firstInnings.totalRuns - secondInnings.totalRuns
          } runs`;
        } else {
          match.result.margin = "Match tied";
        }
      }
    }

    await match.save();

    // Emit ball update event
    const io = getIoInstance();
    io.emit("ballUpdate", { matchId, ballData, match });

    res.json({ success: true, match, ballData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Start new over
const startNewOver = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { bowler, overNumber } = req.body;

    const match = await LiveMatch.findById(matchId);
    if (!match) {
      return res
        .status(404)
        .json({ success: false, message: "Match not found" });
    }

    const currentInnings = match.getCurrentInnings();
    currentInnings.currentBowler = bowler;

    // Add bowler to stats if not already present
    const existingBowler = currentInnings.bowlerStats.find(
      (b) => b.playerName === bowler
    );
    if (!existingBowler) {
      // Find player ID from team rosters
      const allPlayers = [...match.team1Players, ...match.team2Players];
      const bowlerInfo = allPlayers.find((p) => p.playerName === bowler);

      currentInnings.bowlerStats.push({
        playerId: bowlerInfo?.playerId || null,
        playerName: bowler,
        oversBowled: 0,
        ballsBowled: 0,
        runsConceded: 0,
        wickets: 0,
        maidens: 0,
        economy: 0,
        wides: 0,
        noBalls: 0,
      });
    }

    // Create new over
    currentInnings.oversData.push({
      overNumber,
      bowler,
      balls: [],
      runsScored: 0,
      wickets: 0,
      isCompleted: false,
    });

    await match.save();

    // Emit new over event
    const io = getIoInstance();
    io.emit("newOver", { matchId, bowler, overNumber, match });

    res.json({ success: true, match });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Change batsman (after wicket)
const changeBatsman = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { newBatsman, position } = req.body; // position: 'striker' or 'nonStriker'

    const match = await LiveMatch.findById(matchId);
    if (!match) {
      return res
        .status(404)
        .json({ success: false, message: "Match not found" });
    }

    const currentInnings = match.getCurrentInnings();
    currentInnings.currentBatsmen[position] = newBatsman;

    // Initialize new batsman stats
    const existingBatsman = currentInnings.batsmenStats.find(
      (b) => b.playerName === newBatsman
    );
    if (!existingBatsman) {
      // Find player ID from team rosters
      const allPlayers = [...match.team1Players, ...match.team2Players];
      const playerInfo = allPlayers.find((p) => p.playerName === newBatsman);

      currentInnings.batsmenStats.push({
        playerId: playerInfo?.playerId || null,
        playerName: newBatsman,
        runs: 0,
        ballsFaced: 0,
        fours: 0,
        sixes: 0,
        strikeRate: 0,
        isOut: false,
      });
    }

    await match.save();

    // Emit batsman change event
    const io = getIoInstance();
    io.emit("batsmanChange", { matchId, newBatsman, position, match });

    res.json({ success: true, match });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get live match details
const getLiveMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const match = await LiveMatch.findById(matchId);

    if (!match) {
      return res
        .status(404)
        .json({ success: false, message: "Match not found" });
    }

    res.json({ success: true, match });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all live matches
const getAllLiveMatches = async (req, res) => {
  try {
    const matches = await LiveMatch.find()
      .select("matchTitle team1 team2 status createdAt venue")
      .sort({ createdAt: -1 });

    res.json({ success: true, matches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get simplified scorecard for public view
const getScorecard = async (req, res) => {
  try {
    const { matchId } = req.params;
    const match = await LiveMatch.findById(matchId);

    if (!match) {
      return res
        .status(404)
        .json({ success: false, message: "Match not found" });
    }

    const currentInnings = match.getCurrentInnings();
    const scorecard = {
      matchTitle: match.matchTitle,
      team1: match.team1,
      team2: match.team2,
      status: match.status,
      currentInnings: match.currentInnings,
      totalOvers: match.totalOvers,
      venue: match.venue,
      tossWinner: match.tossWinner,
      tossDecision: match.tossDecision,
      result: match.result,
    };

    if (currentInnings) {
      // Get current batsmen stats
      const strikerStats = currentInnings.batsmenStats.find(
        (b) => b.playerName === currentInnings.currentBatsmen.striker
      );
      const nonStrikerStats = currentInnings.batsmenStats.find(
        (b) => b.playerName === currentInnings.currentBatsmen.nonStriker
      );

      scorecard.currentScore = {
        battingTeam: currentInnings.battingTeam,
        runs: currentInnings.totalRuns,
        wickets: currentInnings.wickets,
        overs: currentInnings.overs,
        runRate: currentInnings.runRate,
        currentBatsmen: {
          striker: {
            name: currentInnings.currentBatsmen.striker,
            runs: strikerStats?.runs || 0,
            ballsFaced: strikerStats?.ballsFaced || 0,
          },
          nonStriker: {
            name: currentInnings.currentBatsmen.nonStriker,
            runs: nonStrikerStats?.runs || 0,
            ballsFaced: nonStrikerStats?.ballsFaced || 0,
          },
        },
        currentBowler: currentInnings.currentBowler,
        target: currentInnings.target || null,
        requiredRunRate: currentInnings.requiredRunRate || null,
      };

      // Recent balls (last 6 balls)
      const allBalls = [];
      currentInnings.oversData.forEach((over) => {
        over.balls.forEach((ball) => {
          allBalls.push({
            over: over.overNumber,
            ball: ball.ballNumber,
            runs: ball.runs,
            isWicket: ball.isWicket,
            isExtra: ball.isExtra,
            extraType: ball.extraType,
          });
        });
      });
      scorecard.recentBalls = allBalls.slice(-6);
    }

    // Previous innings summary (if completed)
    if (match.innings[0] && match.innings[0].isCompleted) {
      const firstInnings = match.innings[0];
      scorecard.firstInningsScore = {
        battingTeam: firstInnings.battingTeam,
        runs: firstInnings.totalRuns,
        wickets: firstInnings.wickets,
        overs: firstInnings.overs,
      };
    }

    res.json({ success: true, scorecard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete live match (admin only)
const deleteLiveMatch = async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await LiveMatch.findById(matchId);
    if (!match) {
      return res
        .status(404)
        .json({ success: false, message: "Match not found" });
    }

    // Check if user is the creator or admin
    if (
      match.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this match",
      });
    }

    await LiveMatch.findByIdAndDelete(matchId);

    // Emit match deleted event
    const io = getIoInstance();
    io.emit("matchDeleted", { matchId });

    res.json({ success: true, message: "Match deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  createLiveMatch,
  startMatch,
  recordBall,
  startNewOver,
  changeBatsman,
  getLiveMatch,
  getAllLiveMatches,
  getScorecard,
  deleteLiveMatch,
};
