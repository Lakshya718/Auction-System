import Player from "../models/Player.js";
import fs from "fs";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import { isValidObjectId } from "mongoose";
import Auction from "../models/Auction.js";
import { getIoInstance } from "../utils/socketInstance.js";
import {
  redisClient,
  safeRedisOperation,
  isRedisReady,
} from "../utils/redisClient.js";

const defaultProfilePhoto =
  "https://media.istockphoto.com/id/1961226379/vector/cricket-player-playing-short-concept.jpg?s=612x612&w=0&k=20&c=CSiQd4qzLY-MB5o_anUOnwjIqxm7pP8aus-Lx74AQus=";

export const createPlayerRequest = async (req, res) => {
  try {
    const {
      playerName,
      email,
      phone,
      age,
      sport = "cricket",
      playerRole,
      battingStyle,
      bowlingStyle,
      footedness,
      height,
      wingspan,
      playingExperience,
      country,
      basePrice,
      // Cricket stats
      matches,
      runs,
      wickets,
      average,
      strikeRate,
      economy,
      // Football stats
      goals,
      assists,
      cleanSheets,
      yellowCards,
      redCards,
      // Basketball stats
      points,
      rebounds,
      steals,
      blocks,
      // Volleyball stats
      aces,
      digs,
      // Kabaddi stats
      raidPoints,
      tacklePoints,
      allOutPoints,
      superRaids,
      superTackles,
      description,
    } = req.body;

    // Check for required fields
    if (
      !playerName ||
      !email ||
      !phone ||
      !age ||
      !playerRole ||
      !country ||
      !basePrice
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Sport-specific validation
    if (sport === "cricket" && !battingStyle) {
      return res
        .status(400)
        .json({ error: "Batting style is required for cricket players" });
    }

    if (sport === "football" && !footedness) {
      return res
        .status(400)
        .json({ error: "Footedness is required for football players" });
    }

    if (sport === "basketball" && !height) {
      return res
        .status(400)
        .json({ error: "Height is required for basketball players" });
    }

    if (age <= 0 || basePrice <= 0 || playingExperience < 0 || matches < 0) {
      return res
        .status(400)
        .json({ error: "Numeric fields must be non-negative" });
    }

    // Validate sport-specific fields
    if (sport === "cricket" && (runs < 0 || wickets < 0)) {
      return res
        .status(400)
        .json({ error: "Cricket stats must be non-negative" });
    }

    if (sport === "football" && (goals < 0 || assists < 0)) {
      return res
        .status(400)
        .json({ error: "Football stats must be non-negative" });
    }

    if (sport === "basketball" && (points < 0 || rebounds < 0)) {
      return res
        .status(400)
        .json({ error: "Basketball stats must be non-negative" });
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
      sport: sport || "cricket",
      playerRole,
      battingStyle: battingStyle || "not-applicable",
      bowlingStyle: bowlingStyle || "none",
      footedness: footedness || "not-applicable",
      height: height || 0,
      wingspan: wingspan || 0,
      playingExperience: playingExperience || 0,
      country,
      basePrice,
      // Initialize stats based on sport
      cricketStats:
        sport === "cricket"
          ? {
              matches: matches || 0,
              runs: runs || 0,
              wickets: wickets || 0,
              average: average || 0,
              strikeRate: strikeRate || 0,
              economy: economy || 0,
            }
          : undefined,
      footballStats:
        sport === "football"
          ? {
              matches: matches || 0,
              goals: goals || 0,
              assists: assists || 0,
              cleanSheets: cleanSheets || 0,
              yellowCards: yellowCards || 0,
              redCards: redCards || 0,
            }
          : undefined,
      basketballStats:
        sport === "basketball"
          ? {
              matches: matches || 0,
              points: points || 0,
              rebounds: rebounds || 0,
              assists: assists || 0,
              steals: steals || 0,
              blocks: blocks || 0,
            }
          : undefined,
      volleyballStats:
        sport === "volleyball"
          ? {
              matches: matches || 0,
              points: points || 0,
              aces: aces || 0,
              blocks: blocks || 0,
              digs: digs || 0,
              assists: assists || 0,
            }
          : undefined,
      kabaddiStats:
        sport === "kabaddi"
          ? {
              matches: matches || 0,
              raidPoints: raidPoints || 0,
              tacklePoints: tacklePoints || 0,
              allOutPoints: allOutPoints || 0,
              superRaids: superRaids || 0,
              superTackles: superTackles || 0,
            }
          : undefined,
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
      "playerName email phone age playerRole sport country"
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
    const { search, sport } = req.query;
    let filter = { status: "verified" };
    if (search && search.trim() !== "") {
      filter.playerName = { $regex: search.trim(), $options: "i" };
    }
    if (sport && sport.trim() !== "") {
      filter.sport = sport.trim();
    }
    const players = await Player.find(filter).select(
      "playerName playerRole sport battingStyle bowlingStyle stats country profilePhoto"
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
      sport,
      playerRole,
      battingStyle,
      bowlingStyle,
      footedness,
      height,
      wingspan,
      basePrice,
      // Cricket stats
      matches,
      runs,
      wickets,
      average,
      economy,
      strikeRate,
      // Football stats
      goals,
      assists,
      cleanSheets,
      yellowCards,
      redCards,
      // Basketball stats
      points,
      rebounds,
      steals,
      blocks,
      // Volleyball stats
      aces,
      digs,
      // Kabaddi stats
      raidPoints,
      tacklePoints,
      allOutPoints,
      superRaids,
      superTackles,
      description,
    } = req.body;

    if (basePrice && basePrice <= 0) {
      console.error("Invalid base price:", basePrice);
      return res.status(400).json({ error: "Base price must be positive" });
    }

    if (playerName) player.playerName = playerName;
    if (country) player.country = country;

    // Handle sport change - this is important as it affects which stats object we use
    const sportChanged = sport && player.sport !== sport;
    if (sport) player.sport = sport;

    if (playerRole) player.playerRole = playerRole;
    if (battingStyle) player.battingStyle = battingStyle;
    if (bowlingStyle) player.bowlingStyle = bowlingStyle;
    if (footedness) player.footedness = footedness;
    if (height) player.height = height;
    if (wingspan) player.wingspan = wingspan;
    if (basePrice) player.basePrice = basePrice;

    // If sport has changed, initialize the appropriate stats object
    if (sportChanged) {
      if (sport === "cricket") {
        player.cricketStats = {
          matches: matches || 0,
          runs: runs || 0,
          wickets: wickets || 0,
          average: average || 0,
          strikeRate: strikeRate || 0,
          economy: economy || 0,
        };
        // Reset other sport stats to undefined
        player.footballStats = undefined;
        player.basketballStats = undefined;
        player.volleyballStats = undefined;
        player.kabaddiStats = undefined;
      } else if (sport === "football") {
        player.footballStats = {
          matches: matches || 0,
          goals: goals || 0,
          assists: assists || 0,
          cleanSheets: cleanSheets || 0,
          yellowCards: yellowCards || 0,
          redCards: redCards || 0,
        };
        // Reset other sport stats to undefined
        player.cricketStats = undefined;
        player.basketballStats = undefined;
        player.volleyballStats = undefined;
        player.kabaddiStats = undefined;
      } else if (sport === "basketball") {
        player.basketballStats = {
          matches: matches || 0,
          points: points || 0,
          rebounds: rebounds || 0,
          assists: assists || 0,
          steals: steals || 0,
          blocks: blocks || 0,
        };
        // Reset other sport stats to undefined
        player.cricketStats = undefined;
        player.footballStats = undefined;
        player.volleyballStats = undefined;
        player.kabaddiStats = undefined;
      } else if (sport === "volleyball") {
        player.volleyballStats = {
          matches: matches || 0,
          points: points || 0,
          aces: aces || 0,
          blocks: blocks || 0,
          digs: digs || 0,
          assists: assists || 0,
        };
        // Reset other sport stats to undefined
        player.cricketStats = undefined;
        player.footballStats = undefined;
        player.basketballStats = undefined;
        player.kabaddiStats = undefined;
      } else if (sport === "kabaddi") {
        player.kabaddiStats = {
          matches: matches || 0,
          raidPoints: raidPoints || 0,
          tacklePoints: tacklePoints || 0,
          allOutPoints: allOutPoints || 0,
          superRaids: superRaids || 0,
          superTackles: superTackles || 0,
        };
        // Reset other sport stats to undefined
        player.cricketStats = undefined;
        player.footballStats = undefined;
        player.basketballStats = undefined;
        player.volleyballStats = undefined;
      }
    } else {
      // Update stats for the current sport without changing sport type
      if (player.sport === "cricket") {
        if (!player.cricketStats) player.cricketStats = {};
        if (matches !== undefined) player.cricketStats.matches = matches;
        if (runs !== undefined) player.cricketStats.runs = runs;
        if (wickets !== undefined) player.cricketStats.wickets = wickets;
        if (average !== undefined) player.cricketStats.average = average;
        if (economy !== undefined) player.cricketStats.economy = economy;
        if (strikeRate !== undefined)
          player.cricketStats.strikeRate = strikeRate;
      } else if (player.sport === "football") {
        if (!player.footballStats) player.footballStats = {};
        if (matches !== undefined) player.footballStats.matches = matches;
        if (goals !== undefined) player.footballStats.goals = goals;
        if (assists !== undefined) player.footballStats.assists = assists;
        if (cleanSheets !== undefined)
          player.footballStats.cleanSheets = cleanSheets;
        if (yellowCards !== undefined)
          player.footballStats.yellowCards = yellowCards;
        if (redCards !== undefined) player.footballStats.redCards = redCards;
      } else if (player.sport === "basketball") {
        if (!player.basketballStats) player.basketballStats = {};
        if (matches !== undefined) player.basketballStats.matches = matches;
        if (points !== undefined) player.basketballStats.points = points;
        if (rebounds !== undefined) player.basketballStats.rebounds = rebounds;
        if (assists !== undefined) player.basketballStats.assists = assists;
        if (steals !== undefined) player.basketballStats.steals = steals;
        if (blocks !== undefined) player.basketballStats.blocks = blocks;
      } else if (player.sport === "volleyball") {
        if (!player.volleyballStats) player.volleyballStats = {};
        if (matches !== undefined) player.volleyballStats.matches = matches;
        if (points !== undefined) player.volleyballStats.points = points;
        if (aces !== undefined) player.volleyballStats.aces = aces;
        if (blocks !== undefined) player.volleyballStats.blocks = blocks;
        if (digs !== undefined) player.volleyballStats.digs = digs;
        if (assists !== undefined) player.volleyballStats.assists = assists;
      } else if (player.sport === "kabaddi") {
        if (!player.kabaddiStats) player.kabaddiStats = {};
        if (matches !== undefined) player.kabaddiStats.matches = matches;
        if (raidPoints !== undefined)
          player.kabaddiStats.raidPoints = raidPoints;
        if (tacklePoints !== undefined)
          player.kabaddiStats.tacklePoints = tacklePoints;
        if (allOutPoints !== undefined)
          player.kabaddiStats.allOutPoints = allOutPoints;
        if (superRaids !== undefined)
          player.kabaddiStats.superRaids = superRaids;
        if (superTackles !== undefined)
          player.kabaddiStats.superTackles = superTackles;
      }
    }

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
    // Check if Redis is ready
    if (!isRedisReady()) {
      console.warn("Redis client is not ready - continuing without Redis");
      // Return a "success" response without actually storing in Redis
      return res.status(200).json({
        success: true,
        message:
          "Redis unavailable, but operation marked successful for compatibility",
        data: req.body,
        redisAvailable: false,
      });
    }

    let { _id, profilePhoto, basePrice, playerName, playerRole, auctionId } =
      req.body;

    console.log("storePlayerInRedis called with:", {
      _id,
      auctionId,
      playerName,
    });

    // Validate required fields
    if (!_id) {
      return res.status(400).json({ error: "Player _id is required" });
    }
    if (!auctionId) {
      return res.status(400).json({ error: "auctionId is required" });
    }

    const currentTeam = null;
    const currentBid = basePrice || 0;

    const dataToStore = {
      _id,
      playerName: playerName || "Unknown Player",
      basePrice: basePrice || 0,
      profilePhoto: profilePhoto || "",
      playerRole: playerRole || "Unknown Role",
      currentBid,
      currentTeam,
    };

    // Store player data as a JSON string
    const key = _id;
    const storeResult = await safeRedisOperation(async () => {
      await redisClient.set(key, JSON.stringify(dataToStore));
      return true;
    }, false);

    if (!storeResult) {
      // If Redis operation failed, still return success for compatibility
      return res.status(200).json({
        success: true,
        message:
          "Redis operation failed, but marked as successful for compatibility",
        data: dataToStore,
        redisAvailable: false,
      });
    }

    console.log(`Player data stored in Redis string key: ${key}`);

    // Update Redis hash key for auction-player currentBid and currentTeam
    const redisHashKey = `auction:${auctionId}:player:${_id}`;
    const hashResult = await safeRedisOperation(async () => {
      await redisClient.hSet(redisHashKey, {
        currentBid: currentBid.toString(),
        currentTeam: currentTeam ? currentTeam : "",
      });
      return true;
    }, false);

    if (!hashResult) {
      console.warn(
        `Failed to update hash key ${redisHashKey}, but player data was stored`
      );
    } else {
      console.log(`Player data updated in Redis hash key: ${redisHashKey}`);
    }

    return res.status(200).json({
      success: true,
      message: `Player ${
        playerName || _id
      } with currentBid ${currentBid}, data stored in Redis`,
      data: dataToStore,
      redisAvailable: true,
    });
  } catch (error) {
    console.error("Error storing player in Redis:", error);
    // Return a "success" response to maintain compatibility
    return res.status(200).json({
      success: true,
      message:
        "Error occurred, but operation marked successful for compatibility",
      data: req.body,
      redisAvailable: false,
      error: error.message,
    });
  }
};

export const markPlayerUnsold = async (req, res) => {
  try {
    const { auctionId, playerId } = req.params;

    if (!auctionId || !playerId) {
      return res
        .status(400)
        .json({ error: "auctionId and playerId are required" });
    }

    if (
      !auctionId.match(/^[0-9a-fA-F]{24}$/) ||
      !playerId.match(/^[0-9a-fA-F]{24}$/)
    ) {
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

    res
      .status(200)
      .json({ success: true, message: "Player marked as unsold successfully" });
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

    const player = auction.players.find(
      (p) => p.player.toString() === playerId
    );
    if (!player) {
      return res.status(404).json({ error: "Player not found in auction" });
    }

    if (player.status !== "available") {
      return res
        .status(400)
        .json({ error: "Player is not available for sale" });
    }

    player.status = "sold";
    player.soldTo = teamId;
    player.soldPrice = currentBid;

    const teamBudget = auction.teamBudgets.find(
      (b) => b.team.toString() === teamId
    );
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

    res
      .status(200)
      .json({ success: true, message: "Player sold successfully" });
  } catch (error) {
    console.error("Error selling player:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPlayerFromRedis = async (req, res) => {
  try {
    // Check if Redis is ready
    if (!isRedisReady()) {
      console.warn("Redis client is not ready in getPlayerFromRedis");
      // Return a fallback response
      return res.status(200).json({
        success: false,
        message: "Redis not available, returning empty player data",
        player: { _id: req.params.id },
        redisAvailable: false,
      });
    }

    const key = req.params.id;
    console.log("Fetching player from Redis with key:", key);

    const playerData = await safeRedisOperation(async () => {
      return await redisClient.get(key);
    }, null);

    if (!playerData) {
      console.log(`Player with key ${key} not found in Redis`);
      return res.status(200).json({
        success: false,
        message: "Player not found in Redis",
        player: { _id: key },
        redisAvailable: true,
      });
    }

    try {
      const player = JSON.parse(playerData);
      return res
        .status(200)
        .json({ success: true, player, redisAvailable: true });
    } catch (parseError) {
      console.error("Error parsing Redis data:", parseError);
      return res.status(200).json({
        success: false,
        message: "Invalid player data format",
        player: { _id: key },
        redisAvailable: true,
      });
    }
  } catch (error) {
    console.error("Error fetching player from Redis:", error);
    return res.status(200).json({
      success: false,
      message: "Error fetching player data",
      player: { _id: req.params.id },
      redisAvailable: false,
      error: error.message,
    });
  }
};

export const deletePlayerFromRedis = async (req, res) => {
  try {
    // Check if Redis is ready
    if (!isRedisReady()) {
      console.warn("Redis client is not ready in deletePlayerFromRedis");
      return res.status(200).json({
        success: true,
        message: "Redis not available, but operation marked as successful",
        redisAvailable: false,
      });
    }

    const key = req.params.id;
    console.log("Deleting player from Redis with key:", key);

    // Check if player exists
    const playerExists = await safeRedisOperation(async () => {
      const data = await redisClient.get(key);
      return data !== null;
    }, false);

    if (!playerExists) {
      return res.status(200).json({
        success: true,
        message:
          "Player not found in Redis, but operation marked as successful",
        redisAvailable: true,
      });
    }

    // Delete the player data
    const deleteResult = await safeRedisOperation(async () => {
      await redisClient.del(key);
      return true;
    }, false);

    if (!deleteResult) {
      return res.status(200).json({
        success: true,
        message:
          "Failed to delete player from Redis, but operation marked as successful",
        redisAvailable: true,
      });
    }

    // Also try to delete the auction:auctionId:player:playerId hash
    try {
      const auctions = await Auction.find({});
      for (const auction of auctions) {
        const redisHashKey = `auction:${auction._id}:player:${key}`;
        await safeRedisOperation(async () => {
          await redisClient.del(redisHashKey);
        });
      }
    } catch (err) {
      console.error("Error deleting Redis hash keys:", err);
      // Continue even if this fails - it's a cleanup operation
    }

    return res.status(200).json({
      success: true,
      message: "Player data deleted successfully from Redis",
      redisAvailable: true,
    });
  } catch (error) {
    console.error("Error deleting player from Redis:", error);
    return res.status(200).json({
      success: true,
      message: "Error deleting player data, but operation marked as successful",
      redisAvailable: false,
      error: error.message,
    });
  }
};
