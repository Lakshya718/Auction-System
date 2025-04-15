import Player from '../models/Player.js';
import { deleteMediaFromCloudinary, uploadMedia } from '../utils/cloudinary.js';

const defaultProfilePhoto = "https://media.istockphoto.com/id/1961226379/vector/cricket-player-playing-short-concept.jpg?s=612x612&w=0&k=20&c=CSiQd4qzLY-MB5o_anUOnwjIqxm7pP8aus-Lx74AQus=";

export const createPlayer = async (req, res) => {
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
      bio
    } = req.body;

    const existingPlayer = await Player.findOne({email});
    if(existingPlayer){
      return res.json(400).json({
        error: "player already exists",
      });
    }
    const profileImage = req.file;
    const profilePhoto = defaultProfilePhoto;
    if(profileImage){
      const cloudResponse = await uploadMedia(profileImage.path);
      profilePhoto = cloudResponse.secure_url;
    }
    const playerData = {
      playerName: playerName, 
      email: email,
      phone: phone,
      age: age, 
      playerRole: playerRole,
      battingStyle: battingStyle, 
      bowlingStyle: bowlingStyle,
      playingExperience: playingExperience,
      country: country,
      basePrice: basePrice,
      stats: {
        matches: matches,
        runs: runs,
        wickets: wickets,
        average: average,
        strikeRate: strikeRate,
        economy: economy,
      },
      description: bio,
      profilePhoto: profilePhoto,
    }
    const player = new Player(playerData);
    await player.save();
    return res.status(201).json({
      success: true, 
      message: "player added successfully!",
      player  
    });    
  } catch (error) {
    return res.status(500).json({ error: "internal server error" });
  }
};

export const getAllPlayers = async (req, res) => {
  try {
    const players = await Player.find({});
    return res.status(200).json(players);
  } catch (error) {
    return res.status(500).json({ error: "internal server error" });
  }
};

export const getPlayer = async (req, res) => {
  try {
    const playerId = req.params.id;
    const player = await Player.findById(playerId);
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    return res.status(200).json(player);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const updatePlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
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
    } = req.body;

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
    
    const profileImage = req.file;
    if(player.profilePhoto != defaultProfilePhoto && profileImage){
      const publicId = user.imageUrl.split("/").pop().split(".")[0];
      deleteMediaFromCloudinary(publicId);

      const cloudResponse = await uploadMedia(profileImage.path);
      player.profilePhoto = cloudResponse.secure_url;
    }
  
    await player.save();
    return res.status(200).json(player);
  } catch (error) {
    return res.status(500).json({ error: "internal server error" });
  }
};

export const deletePlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Only allow deletion if player is available
    if (player.available) {
      return res.status(400).json({ error: 'Cannot delete sold player' });
    }

    await player.remove();
    return res.status(200).json({ message: 'Player deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: "internal server error" });
  }
};