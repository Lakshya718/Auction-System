import Match from "../models/Match.js";
import Team from "../models/Team.js";
import Player from "../models/Player.js";
import Auction from "../models/Auction.js";
import { isValidObjectId } from "mongoose";

export const createMatch = async (req, res) => {
  try {
    const { tournament, team1, team2, matchDate, venue } = req.body;

    // Get sport from params or body, with cricket as fallback
    const sport = req.params.sport || req.body.sport || "cricket";

    if (
      !isValidObjectId(tournament) ||
      !isValidObjectId(team1) ||
      !isValidObjectId(team2)
    ) {
      return res.status(400).json({ error: "Invalid auction or team IDs" });
    }

    if (team1 === team2) {
      return res.status(400).json({ error: "Teams cannot be the same" });
    }

    const [auctionExists, team1Exists, team2Exists] = await Promise.all([
      Auction.findById(tournament),
      Team.findById(team1),
      Team.findById(team2),
    ]);

    if (!auctionExists || !team1Exists || !team2Exists) {
      return res.status(400).json({ error: "Auction or teams not found" });
    }

    if (new Date(matchDate) < new Date()) {
      return res
        .status(400)
        .json({ error: "Match date cannot be in the past" });
    }

    // Validate sport is one of the allowed values
    if (
      !["cricket", "football", "basketball", "volleyball", "kabaddi"].includes(
        sport
      )
    ) {
      return res.status(400).json({ error: "Invalid sport type" });
    }

    // Clean up data before saving to prevent empty string validation errors
    const matchData = {
      tournament,
      team1,
      team2,
      matchDate,
      venue: venue || "TBD",
      sport,
    };

    // If playerOfTheMatch is provided and not empty, add it to the match data
    if (
      req.body.playerOfTheMatch &&
      isValidObjectId(req.body.playerOfTheMatch)
    ) {
      matchData.playerOfTheMatch = req.body.playerOfTheMatch;
    }

    // If matchResult is provided, ensure it's a valid enum value
    if (
      req.body.matchResult &&
      ["team1", "team2", "tie", "no-result"].includes(req.body.matchResult)
    ) {
      matchData.matchResult = req.body.matchResult;
    }

    const match = new Match(matchData);
    await match.save();

    res
      .status(201)
      .json({ success: true, message: "Match created successfully", match });
  } catch (error) {
    console.error("Error creating match:", error);
    res
      .status(error.name === "ValidationError" ? 400 : 500)
      .json({ error: error.message });
  }
};

export const getMatch = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid match ID" });
    }

    const match = await Match.findById(id)
      .populate("team1 team2", "name logo")
      .populate({
        path: "tournament",
        select: "tournamentName players",
        populate: {
          path: "players.player",
          select: "playerName",
        },
      })
      .populate("tossWinner", "name")
      .populate("playerOfTheMatch", "playerName");

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    // Calculate score summary based on sport
    let scoreSummary = null;

    if (
      match.sport === "cricket" &&
      match.cricketTeamStats &&
      match.cricketTeamStats.length === 2
    ) {
      scoreSummary = {
        team1Score: `${match.cricketTeamStats[0].score || 0}/${
          match.cricketTeamStats[0].wickets || 0
        } (${match.cricketTeamStats[0].overs || 0} overs)`,
        team2Score: `${match.cricketTeamStats[1].score || 0}/${
          match.cricketTeamStats[1].wickets || 0
        } (${match.cricketTeamStats[1].overs || 0} overs)`,
      };
    } else if (
      match.sport === "football" &&
      match.footballTeamStats &&
      match.footballTeamStats.length === 2
    ) {
      scoreSummary = {
        team1Score: `${match.footballTeamStats[0].goals || 0}`,
        team2Score: `${match.footballTeamStats[1].goals || 0}`,
      };
    } else if (
      match.sport === "basketball" &&
      match.basketballTeamStats &&
      match.basketballTeamStats.length === 2
    ) {
      scoreSummary = {
        team1Score: `${match.basketballTeamStats[0].points || 0}`,
        team2Score: `${match.basketballTeamStats[1].points || 0}`,
      };
    } else if (
      match.sport === "volleyball" &&
      match.volleyballTeamStats &&
      match.volleyballTeamStats.length === 2
    ) {
      scoreSummary = {
        team1Score: `${match.volleyballTeamStats[0].sets || 0} sets`,
        team2Score: `${match.volleyballTeamStats[1].sets || 0} sets`,
      };
    } else if (
      match.sport === "kabaddi" &&
      match.kabaddiTeamStats &&
      match.kabaddiTeamStats.length === 2
    ) {
      scoreSummary = {
        team1Score: `${match.kabaddiTeamStats[0].totalPoints || 0}`,
        team2Score: `${match.kabaddiTeamStats[1].totalPoints || 0}`,
      };
    } else {
      // Default for any other sport or when team stats are not available
      scoreSummary = {
        team1Score: `0`,
        team2Score: `0`,
      };
    }

    // Format match data for response
    const formattedMatch = {
      ...match.toObject(),
      // Make sure sport-specific data is properly accessible
      scorecard:
        match.sport === "cricket"
          ? match.cricketScorecard || []
          : match.sport === "football"
          ? match.footballScorecard || []
          : match.sport === "basketball"
          ? match.basketballScorecard || []
          : match.sport === "volleyball"
          ? match.volleyballScorecard || []
          : match.sport === "kabaddi"
          ? match.kabaddiScorecard || []
          : [],

      teamStats:
        match.sport === "cricket"
          ? match.cricketTeamStats || []
          : match.sport === "football"
          ? match.footballTeamStats || []
          : match.sport === "basketball"
          ? match.basketballTeamStats || []
          : match.sport === "volleyball"
          ? match.volleyballTeamStats || []
          : match.sport === "kabaddi"
          ? match.kabaddiTeamStats || []
          : [],

      scoreSummary: scoreSummary,
    };

    res.status(200).json({ success: true, match: formattedMatch });
  } catch (error) {
    console.error("Error fetching match:", error);
    res
      .status(error.name === "CastError" ? 400 : 500)
      .json({ error: error.message });
  }
};

export const updateMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      matchStatus,
      matchResult,
      tossWinner,
      electedTo,
      playerOfTheMatch,
      scorecard,
      teamStats,
    } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid match ID" });
    }

    const match = await Match.findById(id);
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    const updates = {};

    // Only add defined fields and clean up empty strings
    if (
      matchStatus &&
      Match.schema.path("matchStatus").enumValues.includes(matchStatus)
    ) {
      updates.matchStatus = matchStatus;
    }

    if (
      matchResult &&
      Match.schema.path("matchResult").enumValues.includes(matchResult)
    ) {
      updates.matchResult = matchResult;
    } else if (matchResult === "") {
      // Set to null if empty string is provided
      updates.matchResult = null;
    }

    if (tossWinner && isValidObjectId(tossWinner)) {
      updates.tossWinner = tossWinner;
    } else if (tossWinner === "") {
      // Set to null if empty string is provided
      updates.tossWinner = null;
    }

    if (
      electedTo &&
      Match.schema.path("electedTo").enumValues.includes(electedTo)
    ) {
      updates.electedTo = electedTo;
    } else if (electedTo === "") {
      // Set to null if empty string is provided
      updates.electedTo = null;
    }

    if (playerOfTheMatch && isValidObjectId(playerOfTheMatch)) {
      updates.playerOfTheMatch = playerOfTheMatch;
    } else if (playerOfTheMatch === "") {
      // Set to null if empty string is provided
      updates.playerOfTheMatch = null;
    }

    if (scorecard) {
      // Handle sport-specific scorecard
      const sport = match.sport || "cricket";
      if (sport === "cricket") {
        updates.cricketScorecard = scorecard;
      } else if (sport === "football") {
        updates.footballScorecard = scorecard;
      } else if (sport === "basketball") {
        updates.basketballScorecard = scorecard;
      } else if (sport === "volleyball") {
        updates.volleyballScorecard = scorecard;
      } else if (sport === "kabaddi") {
        updates.kabaddiScorecard = scorecard;
      }
    }

    if (teamStats) {
      // Handle sport-specific team stats
      const sport = match.sport || "cricket";
      if (sport === "cricket") {
        updates.cricketTeamStats = teamStats;
      } else if (sport === "football") {
        updates.footballTeamStats = teamStats;
      } else if (sport === "basketball") {
        updates.basketballTeamStats = teamStats;
      } else if (sport === "volleyball") {
        updates.volleyballTeamStats = teamStats;
      } else if (sport === "kabaddi") {
        updates.kabaddiTeamStats = teamStats;
      }
    }

    // Check if there are any valid updates
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields for update" });
    }

    // Process scorecard updates if provided
    if (updates.cricketScorecard) {
      for (const entry of updates.cricketScorecard) {
        if (!isValidObjectId(entry.player)) {
          return res
            .status(400)
            .json({ error: "Invalid player ID in scorecard" });
        }

        // Update player stats if needed for cricket
        await Player.updateOne(
          { _id: entry.player },
          {
            $inc: {
              "stats.matches": 1,
              "stats.runs": entry.runs || 0,
              "stats.wickets": entry.wicketsTaken || 0,
            },
          }
        );
      }
    } else if (updates.footballScorecard) {
      // Handle football scorecard player stats
      for (const entry of updates.footballScorecard) {
        if (!isValidObjectId(entry.player)) {
          return res
            .status(400)
            .json({ error: "Invalid player ID in scorecard" });
        }

        // Update football player stats if needed
        await Player.updateOne(
          { _id: entry.player },
          {
            $inc: {
              "stats.matches": 1,
              "stats.goals": entry.goals || 0,
              "stats.assists": entry.assists || 0,
            },
          }
        );
      }
    }
    // Add similar handling for other sports if needed

    // Update the match with the filtered updates
    const updatedMatch = await Match.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    const io = req.app.get("io");
    if (io && updates.matchStatus) {
      io.to(updatedMatch.tournament.toString()).emit(
        `match-${updates.matchStatus}`,
        {
          matchId: updatedMatch._id,
          message: `Match ${updates.matchStatus}`,
          match: updatedMatch,
        }
      );
    }

    res
      .status(200)
      .json({ success: true, message: "Match updated successfully", match });
  } catch (error) {
    console.error("Error updating match:", error);
    res
      .status(error.name === "ValidationError" ? 400 : 500)
      .json({ error: error.message });
  }
};

export const getAllMatches = async (req, res) => {
  try {
    const matches = await Match.find()
      .populate("tournament", "tournamentName")
      .populate("team1 team2", "name logo")
      .populate("playerOfTheMatch", "playerName")
      .populate("tossWinner", "name")
      .sort({ matchDate: -1 }); // Sort by date descending (newest first)

    // Transform data to include more relevant information
    const formattedMatches = matches.map((match) => {
      let scoreSummary = null;

      // Create sport-specific score summary based on the sport
      if (
        match.sport === "cricket" &&
        match.cricketTeamStats &&
        match.cricketTeamStats.length === 2
      ) {
        scoreSummary = {
          team1Score: `${match.cricketTeamStats[0].score || 0}/${
            match.cricketTeamStats[0].wickets || 0
          } (${match.cricketTeamStats[0].overs || 0} overs)`,
          team2Score: `${match.cricketTeamStats[1].score || 0}/${
            match.cricketTeamStats[1].wickets || 0
          } (${match.cricketTeamStats[1].overs || 0} overs)`,
        };
      } else if (
        match.sport === "football" &&
        match.footballTeamStats &&
        match.footballTeamStats.length === 2
      ) {
        scoreSummary = {
          team1Score: `${match.footballTeamStats[0].goals || 0}`,
          team2Score: `${match.footballTeamStats[1].goals || 0}`,
        };
      } else if (
        match.sport === "basketball" &&
        match.basketballTeamStats &&
        match.basketballTeamStats.length === 2
      ) {
        scoreSummary = {
          team1Score: `${match.basketballTeamStats[0].points || 0}`,
          team2Score: `${match.basketballTeamStats[1].points || 0}`,
        };
      } else if (
        match.sport === "volleyball" &&
        match.volleyballTeamStats &&
        match.volleyballTeamStats.length === 2
      ) {
        scoreSummary = {
          team1Score: `${match.volleyballTeamStats[0].sets || 0} sets`,
          team2Score: `${match.volleyballTeamStats[1].sets || 0} sets`,
        };
      } else if (
        match.sport === "kabaddi" &&
        match.kabaddiTeamStats &&
        match.kabaddiTeamStats.length === 2
      ) {
        scoreSummary = {
          team1Score: `${match.kabaddiTeamStats[0].totalPoints || 0}`,
          team2Score: `${match.kabaddiTeamStats[1].totalPoints || 0}`,
        };
      } else {
        // Default for any other sport or when team stats are not available
        scoreSummary = {
          team1Score: `0`,
          team2Score: `0`,
        };
      }

      return {
        _id: match._id,
        tournament: match.tournament,
        team1: match.team1,
        team2: match.team2,
        matchDate: match.matchDate,
        venue: match.venue,
        matchStatus: match.matchStatus,
        matchResult: match.matchResult,
        tossWinner: match.tossWinner,
        electedTo: match.electedTo,
        playerOfTheMatch: match.playerOfTheMatch,
        sport: match.sport || "cricket", // Default to cricket if not specified
        scoreSummary: scoreSummary,
      };
    });

    res.status(200).json({ success: true, matches: formattedMatches });
  } catch (error) {
    console.error("Error fetching all matches:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMatchesByTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    if (!isValidObjectId(tournamentId)) {
      return res.status(400).json({ error: "Invalid auction ID" });
    }

    const matches = await Match.find({ tournament: tournamentId })
      .populate("team1 team2", "name logo")
      .populate("playerOfTheMatch", "playerName")
      .populate("tossWinner", "name")
      .sort({ matchDate: 1 });

    // Transform data to include more relevant information
    const formattedMatches = matches.map((match) => {
      let scoreSummary = null;

      // Create sport-specific score summary based on the sport
      if (
        match.sport === "cricket" &&
        match.cricketTeamStats &&
        match.cricketTeamStats.length === 2
      ) {
        scoreSummary = {
          team1Score: `${match.cricketTeamStats[0].score || 0}/${
            match.cricketTeamStats[0].wickets || 0
          } (${match.cricketTeamStats[0].overs || 0} overs)`,
          team2Score: `${match.cricketTeamStats[1].score || 0}/${
            match.cricketTeamStats[1].wickets || 0
          } (${match.cricketTeamStats[1].overs || 0} overs)`,
        };
      } else if (
        match.sport === "football" &&
        match.footballTeamStats &&
        match.footballTeamStats.length === 2
      ) {
        scoreSummary = {
          team1Score: `${match.footballTeamStats[0].goals || 0}`,
          team2Score: `${match.footballTeamStats[1].goals || 0}`,
        };
      } else if (
        match.sport === "basketball" &&
        match.basketballTeamStats &&
        match.basketballTeamStats.length === 2
      ) {
        scoreSummary = {
          team1Score: `${match.basketballTeamStats[0].points || 0}`,
          team2Score: `${match.basketballTeamStats[1].points || 0}`,
        };
      } else if (
        match.sport === "volleyball" &&
        match.volleyballTeamStats &&
        match.volleyballTeamStats.length === 2
      ) {
        scoreSummary = {
          team1Score: `${match.volleyballTeamStats[0].sets || 0} sets`,
          team2Score: `${match.volleyballTeamStats[1].sets || 0} sets`,
        };
      } else if (
        match.sport === "kabaddi" &&
        match.kabaddiTeamStats &&
        match.kabaddiTeamStats.length === 2
      ) {
        scoreSummary = {
          team1Score: `${match.kabaddiTeamStats[0].totalPoints || 0}`,
          team2Score: `${match.kabaddiTeamStats[1].totalPoints || 0}`,
        };
      } else {
        // Default for any other sport or when team stats are not available
        scoreSummary = {
          team1Score: `0`,
          team2Score: `0`,
        };
      }

      return {
        _id: match._id,
        tournament: match.tournament,
        team1: match.team1,
        team2: match.team2,
        matchDate: match.matchDate,
        venue: match.venue,
        matchStatus: match.matchStatus,
        matchResult: match.matchResult,
        tossWinner: match.tossWinner,
        electedTo: match.electedTo,
        playerOfTheMatch: match.playerOfTheMatch,
        sport: match.sport || "cricket", // Default to cricket if not specified
        scoreSummary: scoreSummary,
      };
    });

    res.status(200).json({ success: true, matches: formattedMatches });
  } catch (error) {
    console.error("Error fetching matches:", error);
    res
      .status(error.name === "CastError" ? 400 : 500)
      .json({ error: error.message });
  }
};
