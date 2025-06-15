import Player from '../models/Player.js';
import fs from 'fs';
import { deleteMediaFromCloudinary, uploadMedia } from '../utils/cloudinary.js';
import { isValidObjectId } from 'mongoose';

const defaultProfilePhoto =
  'https://media.istockphoto.com/id/1961226379/vector/cricket-player-playing-short-concept.jpg?s=612x612&w=0&k=20&c=CSiQd4qzLY-MB5o_anUOnwjIqxm7pP8aus-Lx74AQus=';

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
      description
    } = req.body;

    if (!playerName || !email || !phone || !age || !playerRole || !battingStyle || !country || !basePrice) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (age <= 0 || basePrice <= 0 || playingExperience < 0 || matches < 0 || runs < 0 || wickets < 0) {
      return res.status(400).json({ error: 'Numeric fields must be non-negative' });
    }

    const existingPlayer = await Player.findOne({ $or: [{ email }, { phone }] });
    if (existingPlayer) {
      return res.status(400).json({ error: 'Player with same email or phone already exists' });
    }

    const files = req.files;
    let profilePhoto = defaultProfilePhoto;
    if (files.profilePhoto && files.profilePhoto.length > 0) {
      try {
        const photo = files.profilePhoto[0];
        const cloudResponse = await uploadMedia(photo.path);
        profilePhoto = cloudResponse.secure_url;
      } catch (error) {
        console.error('Error uploading profile photo:', error);
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
          console.error('Error uploading certificate:', error);
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
      bowlingStyle: bowlingStyle || 'none',
      playingExperience: playingExperience || 0,
      country,
      basePrice,
      stats: { matches, runs, wickets, average, strikeRate, economy },
      description,
      profilePhoto,
      certificates,
      status: 'pending'
    });

    await newPlayer.save();

    res.status(201).json({
      success: true,
      message: 'Player registration request submitted successfully',
      player: newPlayer
    });
  } catch (error) {
    console.error('Error creating player request:', error);
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ error: error.message });
  }
};

export const getAllPendingPlayerRegistrationRequests = async (req, res) => {
  try {
    const requestingPlayers = await Player.find({ status: 'pending' })
      .select('playerName email phone age playerRole country');
    res.status(200).json({ success: true, requestingPlayers });
  } catch (error) {
    console.error('Error fetching pending players:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const reviewPendingPlayerRegistrationRequests = async (req, res) => {
  try {
    const { playerId, status } = req.body;
    if (!isValidObjectId(playerId)) {
      return res.status(400).json({ error: 'Invalid player ID' });
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status, must be accepted or rejected' });
    }

    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    if (status === 'accepted') {
      player.status = 'verified';
      await player.save();
      res.status(200).json({ message: 'Player reviewed and added successfully', player });
    } else {
      if (player.profilePhoto !== defaultProfilePhoto) {
        const publicId = player.profilePhoto.split('/').pop().split('.')[0];
        await deleteMediaFromCloudinary(publicId);
      }
      for (const certUrl of player.certificates) {
        const publicId = certUrl.split('/').pop().split('.')[0];
        await deleteMediaFromCloudinary(publicId);
      }
      await Player.deleteOne({ _id: playerId });
      res.status(200).json({ message: 'Player deleted successfully' });
    }
  } catch (error) {
    console.error('Error reviewing player request:', error);
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ error: error.message });
  }
};

export const getAllVerifiedPlayers = async (req, res) => {
  try {
    const players = await Player.find({ status: 'verified' })
      .select('playerName playerRole battingStyle bowlingStyle stats country');
    res.status(200).json({ success: true, players });
  } catch (error) {
    console.error('Error fetching verified players:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPlayer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid player ID' });
    }

    const player = await Player.findById(id);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.status(200).json({ success: true, player });
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(error.name === 'CastError' ? 400 : 500).json({ error: error.message });
  }
};

export const updatePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid player ID' });
    }

    const player = await Player.findById(id);
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
      description
    } = req.body;

    if (basePrice && basePrice <= 0) {
      return res.status(400).json({ error: 'Base price must be positive' });
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

    if (req.files?.profilePhoto) {
      if (player.profilePhoto !== defaultProfilePhoto) {
        const publicId = player.profilePhoto.split('/').pop().split('.')[0];
        await deleteMediaFromCloudinary(publicId);
      }
      const cloudResponse = await uploadMedia(req.files.profilePhoto[0].path);
      fs.unlinkSync(req.files.profilePhoto[0].path);
      player.profilePhoto = cloudResponse.secure_url;
    }

    await player.save();
    res.status(200).json({ success: true, player });
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ error: error.message });
  }
};

export const deletePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid player ID' });
    }

    const player = await Player.findById(id);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    if (player.profilePhoto && player.profilePhoto !== defaultProfilePhoto) {
      const publicId = player.profilePhoto.split('/').pop().split('.')[0];
      await deleteMediaFromCloudinary(publicId);
    }
    for (const certUrl of player.certificates) {
      const publicId = certUrl.split('/').pop().split('.')[0];
      await deleteMediaFromCloudinary(publicId);
    }

    await Player.deleteOne({ _id: id });
    res.status(200).json({ message: 'Player deleted successfully' });
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(error.name === 'CastError' ? 400 : 500).json({ error: error.message });
  }
};

// New controller functions for Redis storage and retrieval

export const storePlayerInRedis = async (req, res) => {
  try {
    const redisClient = req.app.get('redisClient');
    //i want to change some of these values so, to declare as a const is best practise?
    const { _id, basePrice, playerName, playerRole, currentBid = 0, currentTeam = null, soldStatus = false} = req.body;

    if (!_id) {
      return res.status(400).json({ error: 'Player _id is required' });
    }

    const dataToStore = {
      playerName,
      basePrice,
      playerRole,
      currentBid,
      currentTeam,
      soldStatus,
    };

    // const key = `current_player`;
    const key = _id;
    await redisClient.set(key, JSON.stringify(dataToStore));

    res.status(200).json({ success: true, message: `Player ${playerName} data stored in Redis`, data: dataToStore });
  } catch (error) {
    console.error('Error storing player in Redis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPlayerFromRedis = async (req, res) => {
  try {
    const redisClient = req.app.get('redisClient');

    // const key = `current_player`;
    const key = req.params.id;
    const playerData = await redisClient.get(key);

    if (!playerData) {
      return res.status(404).json({ error: 'Player not found in Redis' });
    }

    const player = JSON.parse(playerData);
    res.status(200).json({ success: true, player });
  } catch (error) {
    console.error('Error fetching player from Redis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
