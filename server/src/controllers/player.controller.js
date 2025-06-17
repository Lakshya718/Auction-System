import Player from "../models/Player.js";
import fs from "fs";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import { isValidObjectId } from "mongoose";
import Auction from "../models/Auction.js";
import { getIoInstance } from "../utils/socketInstance.js";
import { redisClient } from "../utils/redisClient.js";

const defaultProfilePhoto =
  "https://media.istockphoto.com/id/1961226379/vector/cricket-player-playing-short-concept.jpg?s=612x612&w=0&k=20&c=CSiQd4qzLY-MB5o_anUOnwjIqxm7pP8aus-Lx74AQus=";

export const createPlayerRequest = async (req, res) => {
  try {
    const {
      playerName,
      email,
      phone,
      age,
      playerRole,
      battingStyle,
      bowlingStyle,
      playingExperience,
      country,
      basePrice,
      matches,
      runs,
      wickets,
      average,
      strikeRate,
      economy,
      description,
    } = req.body;

    if (
      !playerName ||
      !email ||
      !phone ||
      !age ||
      !playerRole ||
      !battingStyle ||
      !country ||
      !basePrice
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (
      age <= 0 ||
      basePrice <= 0 ||
      playingExperience < 0 ||
      matches < 0 ||
      runs < 0 ||
      wickets < 0
    ) {
      return res
        .status(400)
        .json({ error: "Numeric fields must be non-negative" });
    }

    const existingPlayer = await Player.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingPlayer) {
      return res
        .status(400)
        .json({ error: "Player with same email or phone already exists" });
    }

    const files = req.files;
    let profilePhoto = defaultProfilePhoto;
    if (files.profilePhoto && files.profilePhoto.length > 0) {
      try {
        const photo = files.profilePhoto[0];
        const cloudResponse = await uploadMedia(photo.path);
        profilePhoto = cloudResponse.secure_url;
      } catch (error) {
        console.error("Error uploading profile photo:", error);
        throw error;
      } finally {
        fs.unlinkSync(files.profilePhoto[0].path);
      }
    }

    let certificates = [];
    if (files.certificates && files.certificates.length > 0) {
      for (const cert of files.certificates) {
        try {
          const cloudResponse = await uploadMedia(cert.path);
          certificates.push(cloudResponse.secure_url);
        } catch (error) {
          console.error("Error uploading certificate:", error);
          throw error;
        } finally {
          fs.unlinkSync(cert.path);
        }
      }
    }

    const newPlayer = new Player({
      playerName,
      email,
      phone,
      age,
      playerRole,
      battingStyle,
      bowlingStyle: bowlingStyle || "none",
      playingExperience: playingExperience || 0,
      country,
      basePrice,
      stats: { matches, runs, wickets, average, strikeRate, economy },
      description,
      profilePhoto,
      certificates,
      status: "pending",
    });

    await newPlayer.save();

    res.status(201).json({
      success: true,
      message: "Player registration request submitted successfully",
      player: newPlayer,
    });
  } catch (error) {
    console.error("Error creating player request:", error);
    res
      .status(error.name === "ValidationError" ? 400 : 500)
      .json({ error: error.message });
  }
};

export const getAllPendingPlayerRegistrationRequests = async (req, res) => {
  try {
    const requestingPlayers = await Player.find({ status: "pending" }).select(
      "playerName email phone age playerRole country"
    );
    res.status(200).json({ success: true, requestingPlayers });
  } catch (error) {
    console.error("Error fetching pending players:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const reviewPendingPlayerRegistrationRequests = async (req, res) => {
  try {
    const { playerId, status } = req.body;
    if (!isValidObjectId(playerId)) {
      return res.status(400).json({ error: "Invalid player ID" });
    }

    if (!["accepted", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ error: "Invalid status, must be accepted or rejected" });
    }

    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    if (status === "accepted") {
      player.status = "verified";
      await player.save();
      res
        .status(200)
        .json({ message: "Player reviewed and added successfully", player });
    } else {
      if (player.profilePhoto !== defaultProfilePhoto) {
        const publicId = player.profilePhoto.split("/").pop().split(".")[0];
        await deleteMediaFromCloudinary(publicId);
      }
      for (const certUrl of player.certificates) {
        const publicId = certUrl.split("/").pop().split(".")[0];
        await deleteMediaFromCloudinary(publicId);
      }
      await Player.deleteOne({ _id: playerId });
      res.status(200).json({ message: "Player deleted successfully" });
    }
  } catch (error) {
    console.error("Error reviewing player request:", error);
    res
      .status(error.name === "ValidationError" ? 400 : 500)
      .json({ error: error.message });
  }
};

export const getAllVerifiedPlayers = async (req, res) => {
  try {
    const { search } = req.query;
    let filter = { status: "verified" };
    if (search && search.trim() !== "") {
      filter.playerName = { $regex: search.trim(), $options: "i" };
    }
    const players = await Player.find(filter).select(
      "playerName playerRole battingStyle bowlingStyle stats country profilePhoto"
    );
    res.status(200).json({ success: true, players });
  } catch (error) {
    console.error("Error fetching verified players:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPlayer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid player ID" });
    }

    const player = await Player.findById(id);
    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    res.status(200).json({ success: true, player });
  } catch (error) {
    console.error("Error fetching player:", error);
    res
      .status(error.name === "CastError" ? 400 : 500)
      .json({ error: error.message });
  }
};

export const updatePlayer = async (req, res) => {
  try {
    console.log("Update player request received with body:", req.body);
    console.log("Files received:", req.files);

    const { id } = req.params;
    if (!isValidObjectId(id)) {
      console.error("Invalid player ID:", id);
      return res.status(400).json({ error: "Invalid player ID" });
    }

    const player = await Player.findById(id);
    if (!player) {
      console.error("Player not found with ID:", id);
      return res.status(404).json({ error: "Player not found" });
    }

    const {
      playerName,
      country,
      playerRole,
      basePrice,
      matches,
      runs,
      wickets,
      average,
      economy,
      strikeRate,
      description,
    } = req.body;

    if (basePrice && basePrice <= 0) {
      console.error("Invalid base price:", basePrice);
      return res.status(400).json({ error: "Base price must be positive" });
    }

    if (playerName) player.playerName = playerName;
    if (country) player.country = country;
    if (playerRole) player.playerRole = playerRole;
    if (basePrice) player.basePrice = basePrice;
    if (matches !== undefined) player.stats.matches = matches;
    if (runs !== undefined) player.stats.runs = runs;
    if (wickets !== undefined) player.stats.wickets = wickets;
    if (average !== undefined) player.stats.average = average;
    if (economy !== undefined) player.stats.economy = economy;
    if (strikeRate !== undefined) player.stats.strikeRate = strikeRate;
    if (description) player.description = description;

    if (req.file) {
      console.log("Profile photo file received:", req.file);
      if (player.profilePhoto !== defaultProfilePhoto) {
        const publicId = player.profilePhoto.split("/").pop().split(".")[0];
        await deleteMediaFromCloudinary(publicId);
      }
      const cloudResponse = await uploadMedia(req.file.path);
      fs.unlinkSync(req.file.path);
      player.profilePhoto = cloudResponse.secure_url;
    }

    await player.save();
    console.log("Player updated successfully:", player);
    res.status(200).json({ success: true, player });
  } catch (error) {
    console.error("Error updating player:", error);
    res
      .status(error.name === "ValidationError" ? 400 : 500)
      .json({ error: error.message });
  }
};

export const deletePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid player ID" });
    }

    const player = await Player.findById(id);
    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    if (player.profilePhoto && player.profilePhoto !== defaultProfilePhoto) {
      const publicId = player.profilePhoto.split("/").pop().split(".")[0];
      await deleteMediaFromCloudinary(publicId);
    }
    for (const certUrl of player.certificates) {
      const publicId = certUrl.split("/").pop().split(".")[0];
      await deleteMediaFromCloudinary(publicId);
    }

    await Player.deleteOne({ _id: id });
    res.status(200).json({ message: "Player deleted successfully" });
  } catch (error) {
    console.error("Error deleting player:", error);
    res
      .status(error.name === "CastError" ? 400 : 500)
      .json({ error: error.message });
  }
};

export const storePlayerInRedis = async (req, res) => {
  try {
    const redisClient = req.app.get("redisClient");
    let { _id, profilePhoto, basePrice, playerName, playerRole, auctionId } = req.body;

    console.log("storePlayerInRedis called with:", { _id, auctionId });

    const currentTeam = null;
    const currentBid = basePrice;
    if (!_id) {
      console.error("Player _id is missing");
      return res.status(400).json({ error: "Player _id is required" });
    }
    if (!auctionId) {
      console.error("auctionId is missing");
      return res.status(400).json({ error: "auctionId is required" });
    }

    const dataToStore = {
      playerName,
      basePrice,
      profilePhoto,
      playerRole,
      currentBid,
      currentTeam,
    };

    // const key = `current_player`;
    const key = _id;
    await redisClient.set(key, JSON.stringify(dataToStore));
    console.log(`Player data stored in Redis string key: ${key}`);

    // Update Redis hash key for auction-player currentBid and currentTeam
    const redisHashKey = `auction:${auctionId}:player:${_id}`;
    await redisClient.hSet(redisHashKey, {
      currentBid: currentBid,
      currentTeam: currentTeam ? currentTeam : "",
    });
    console.log(`Player data updated in Redis hash key: ${redisHashKey}`);

    res.status(200).json({
      success: true,
      message: `Player ${playerName} with currentBid ${currentBid}, data stored in Redis`,
      data: dataToStore,
    });
  } catch (error) {
    console.error("Error storing player in Redis:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markPlayerUnsold = async (req, res) => {
  try {
    const { auctionId, playerId } = req.params;

    if (!auctionId || !playerId) {
      return res.status(400).json({ error: "auctionId and playerId are required" });
    }

    if (!auctionId.match(/^[0-9a-fA-F]{24}$/) || !playerId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid auctionId or playerId" });
    }

    // Update the player's status to "unsold" in the auction's players array
    const auction = await Auction.findOneAndUpdate(
      { _id: auctionId, "players.player": playerId },
      { $set: { "players.$.status": "unsold" } },
      { new: true }
    );

    if (!auction) {
      return res.status(404).json({ error: "Auction or player not found" });
    }

    // Clear Redis cache for the player
    await redisClient.del(playerId);

    // Clear teamOwner player state cache
    // Assuming teamOwner player state keys follow a pattern, e.g., `teamOwner:player:${playerId}`
    // Adjust the pattern as per your Redis key naming conventions
    const keys = await redisClient.keys(`teamOwner:player:${playerId}*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }

    // Emit socket event to notify clients about the player status update
    const io = getIoInstance();
    io.to(auctionId).emit("player-unsold", { auctionId, playerId });

    res.status(200).json({ success: true, message: "Player marked as unsold successfully" });
  } catch (error) {
    console.error("Error marking player as unsold:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sellPlayer = async (req, res) => {
  try {
    const { auctionId, playerId, teamId, currentBid } = req.body;

    if (!auctionId || !playerId || !teamId || !currentBid) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    const player = auction.players.find(p => p.player.toString() === playerId);
    if (!player) {
      return res.status(404).json({ error: "Player not found in auction" });
    }

    if (player.status !== "available") {
      return res.status(400).json({ error: "Player is not available for sale" });
    }

    player.status = "sold";
    player.soldTo = teamId;
    player.soldPrice = currentBid;

    const teamBudget = auction.teamBudgets.find(b => b.team.toString() === teamId);
    if (!teamBudget) {
      return res.status(400).json({ error: "Team budget not found" });
    }

    if (teamBudget.remainingBudget < currentBid) {
      return res.status(400).json({ error: "Insufficient team budget" });
    }

    teamBudget.remainingBudget -= currentBid;

    await auction.save();

    // Emit player-sold event after successful save
    const io = getIoInstance();
    io.to(auctionId).emit("player-sold", {
      auctionId,
      playerId,
      teamId,
      amount: currentBid,
      playerName: player.playerName,
      teamName: teamBudget.team.toString(),
    });

    res.status(200).json({ success: true, message: "Player sold successfully" });
  } catch (error) {
    console.error("Error selling player:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPlayerFromRedis = async (req, res) => {
  try {
    const redisClient = req.app.get("redisClient");

    // const key = `current_player`;
    const key = req.params.id;
    const playerData = await redisClient.get(key);

    if (!playerData) {
      return res.status(404).json({ error: "Player not found in Redis" });
    }

    const player = JSON.parse(playerData);
    res.status(200).json({ success: true, player });
  } catch (error) {
    console.error("Error fetching player from Redis:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deletePlayerFromRedis = async (req, res) => {
  try {
    const redisClient = req.app.get("redisClient");
    const key = req.params.id;

    const playerData = await redisClient.get(key);
    if (!playerData) {
      return res
        .status(404)
        .json({ error: "No such player found with this id" });
    }

    await redisClient.del(key);
    res
      .status(200)
      .json({ success: true, message: "Player data deleted successfully" });
  } catch (error) {
    console.error("Error deleting player from Redis:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
