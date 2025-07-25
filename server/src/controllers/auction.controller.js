import Auction from "../models/Auction.js";
import Team from "../models/Team.js";
import Player from "../models/Player.js";
import { isValidObjectId } from "mongoose";

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
      retainedPlayers,
    } = req.body;

    if (
      !tournamentName ||
      !date ||
      !startTime ||
      !maxBudget ||
      !teams ||
      !players
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (maxBudget <= 0 || minBidIncrement <= 0) {
      return res
        .status(400)
        .json({ error: "Budget and bid increment must be positive" });
    }

    if (!/^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/.test(startTime)) {
      return res.status(400).json({ error: "Invalid start time format" });
    }

    const invalidIds = teams
      .concat(players, retainedPlayers?.map((r) => r.player) || [])
      .filter((id) => !isValidObjectId(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ error: "Invalid team or player IDs" });
    }

    const [teamsExist, playersExist] = await Promise.all([
      Team.find({ _id: { $in: teams } }).countDocuments(),
      Player.find({ _id: { $in: players } }).countDocuments(),
    ]);

    if (teamsExist !== teams.length || playersExist !== players.length) {
      return res.status(400).json({ error: "Some teams or players not found" });
    }

    const formattedPlayers = players.map((playerId) => ({
      player: playerId,
      status: "available",
      currentBid: 0,
    }));

    const formattedRetainedPlayers =
      retainedPlayers?.map(({ player, team }) => {
        if (!isValidObjectId(team) || !teams.includes(team)) {
          throw new Error("Invalid or unauthorized team in retained players");
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
      teamBudgets: teams.map((teamId) => ({
        team: teamId,
        remainingBudget: maxBudget,
      })),
    });

    await newAuction.save();

    // Initialize Redis hash keys for each player in the auction
    const { redisClient } = await import("../utils/redisClient.js");
    for (const playerEntry of newAuction.players) {
      const redisKey = `auction:${newAuction._id}:player:${playerEntry.player}`;
      await redisClient.hSet(redisKey, {
        currentBid: 0,
        currentTeam: "",
      });
    }

    res.status(201).json({
      success: true,
      message: "Auction created successfully",
      auction: newAuction,
    });
  } catch (error) {
    console.error("Error creating auction:", error);
    res
      .status(error.name === "ValidationError" ? 400 : 500)
      .json({ error: error.message });
  }
};

export const getAllAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find()
      .populate("teams", "name")
      .populate("players.player", "playerName")
      .populate("retainedPlayers.player", "playerName")
      .populate("retainedPlayers.team", "name");
    res.status(200).json({ success: true, auctions });
  } catch (error) {
    console.error("Error fetching auctions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAuctionById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid auction ID" });
    }

    const auction = await Auction.findById(id)
      .populate("teams", "name")
      .populate(
        "players.player",
        "_id playerName basePrice playerRole profilePhoto"
      )
      .populate(
        "retainedPlayers.player",
        "playerName basePrice playerRole profilePhoto"
      )
      .populate("retainedPlayers.team", "name");

    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    res.status(200).json({ success: true, auction });
  } catch (error) {
    console.error("Error fetching auction:", error);
    res
      .status(error.name === "CastError" ? 400 : 500)
      .json({ error: error.message });
  }
};

export const updateAuctionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
   
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid auction ID" });
    }

    const validStatuses = Auction.schema.path("status").enumValues;
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const auction = await Auction.findById(id);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    auction.status = status;
    await auction.save();

    const io = req.app.get("io");
    if (io && status === "active") {
      io.to(auction._id.toString()).emit("auction-started", {
        auctionId: auction._id,
        message: "Auction has started!",
      });
    } else if (io && status === "completed") {
      io.to(auction._id.toString()).emit("auction-completed", {
        auctionId: auction._id,
        message: "Auction has completed!",
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Auction status updated", auction });
  } catch (error) {
    console.error("Error updating auction status:", error);
    res
      .status(error.name === "ValidationError" ? 400 : 500)
      .json({ error: error.message });
  }
};

export const updateAuction = async (req, res) => {
  try {
    const auctionId = req.params.id;
    const {
      tournamentName,
      description,
      date,
      startTime,
      minBidIncrement,
      maxBudget,
      status,
    } = req.body;

    if (!isValidObjectId(auctionId)) {
      return res.status(400).json({ error: "Invalid auction ID" });
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    // Update fields if provided
    if (tournamentName !== undefined) auction.tournamentName = tournamentName;
    if (description !== undefined) auction.description = description;
    if (date !== undefined) auction.date = date;
    if (startTime !== undefined) auction.startTime = startTime;
    if (minBidIncrement !== undefined) auction.minBidIncrement = minBidIncrement;
    if (maxBudget !== undefined) auction.maxBudget = maxBudget;
    if (status !== undefined) auction.status = status;

    await auction.save();

    res.status(200).json({ success: true, auction });
  } catch (error) {
    console.error("Error updating auction:", error);
    res.status(500).json({ error: "Failed to update auction" });
  }
};

// export const updateAuctionTeamsPlayers = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { teams, players } = req.body;

//     if (!isValidObjectId(id)) {
//       return res.status(400).json({ error: "Invalid auction ID" });
//     }

//     if (!Array.isArray(teams) || !Array.isArray(players)) {
//       return res.status(400).json({ error: "Teams and players must be arrays" });
//     }

//     // Validate team and player IDs
//     const invalidTeamIds = teams.filter((teamId) => !isValidObjectId(teamId));
//     const invalidPlayerIds = players.filter((playerId) => !isValidObjectId(playerId));

//     if (invalidTeamIds.length > 0 || invalidPlayerIds.length > 0) {
//       return res.status(400).json({ error: "Invalid team or player IDs" });
//     }

//     const auction = await Auction.findById(id);
//     if (!auction) {
//       return res.status(404).json({ error: "Auction not found" });
//     }

//     // Update teams and players
//     auction.teams = teams;
//     auction.players = players.map((playerId) => ({
//       player: playerId,
//       status: "available",
//       currentBid: 0,
//     }));

//     // Update teamBudgets for new teams
//     auction.teamBudgets = teams.map((teamId) => {
//       const existingBudget = auction.teamBudgets.find((tb) => tb.team.toString() === teamId.toString());
//       return existingBudget || { team: teamId, remainingBudget: auction.maxBudget };
//     });

//     await auction.save();

//     res.status(200).json({ success: true, message: "Auction teams and players updated", auction });
//   } catch (error) {
//     console.error("Error updating auction teams and players:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

export const sellPlayer = async (req, res) => {
  try {
    const { auctionId, playerId, teamId, currentBid } = req.body;

    if (
      !isValidObjectId(auctionId) ||
      !isValidObjectId(playerId) ||
      !isValidObjectId(teamId)
    ) {
      return res
        .status(400)
        .json({ error: "Invalid auction, player, or team ID" });
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    // Find the player in the auction players array
    const playerEntry = auction.players.find(
      (p) => p.player.toString() === playerId
    );
    if (!playerEntry) {
      return res.status(404).json({ error: "Player not found in auction" });
    }

    // Update player entry
    playerEntry.soldTo = teamId;
    playerEntry.soldPrice = currentBid;
    playerEntry.status = "sold";

    // Deduct currentBid from team's remaining budget
    const teamBudgetEntry = auction.teamBudgets.find(
      (tb) => tb.team.toString() === teamId
    );
    if (!teamBudgetEntry) {
      return res.status(404).json({ error: "Team budget not found" });
    }

    teamBudgetEntry.remainingBudget -= currentBid;

    await auction.save();

    // Add playerId with purchasePrice and timestamp to the team's players array if not already present
    const team = await Team.findById(teamId);
    if (team) {
      team.players.push({
        player: playerId,
        purchasePrice: currentBid,
        timestamp: new Date(),
      });
      await team.save();
    }

    // Emit socket event to notify clients about player sold update
    const io = req.app.get("io");
    if (io) {
      io.to(auction._id.toString()).emit("player-sold", {
        playerId,
        teamId,
        soldPrice: currentBid,
      });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Player sold successfully",
        player: playerEntry,
      });
  } catch (error) {
    console.error("Error selling player:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
