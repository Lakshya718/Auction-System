import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Team from '../models/Team.js';
import { uploadMedia, deleteMediaFromCloudinary } from '../utils/cloudinary.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role, teamName } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['admin', 'team_owner'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    let user = new User({ name, email, password, role });
    await user.save();

    try {
      if (role === 'team_owner') {
        if (!teamName) {
          throw new Error('Team name required for team_owner role');
        }

        const existingTeam = await Team.findOne({ name: teamName });
        if (existingTeam) {
          throw new Error('Team name already exists');
        }

        let imageUrl = 'https://t3.ftcdn.net/jpg/05/13/39/96/360_F_513399651_7X6aDPItRkVK4RtrysnGF8A88Gyfes3T.jpg';
        if (req.file) {
          const cloudResponse = await uploadMedia(req.file.path);
          imageUrl = cloudResponse.secure_url;
        }

        const team = new Team({ name: teamName, logo: imageUrl, owner: user._id });
        await team.save();
      }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      });

      res.status(201).json({
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        token
      });
    } catch (error) {
      await User.deleteOne({ _id: user._id });
      throw error;
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(error.name === 'ValidationError' ? 400 : 500).json({ error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let profileData = { user };
    if (user.role === 'team_owner') {
      const team = await Team.findOne({ owner: user._id });
      profileData.team = team || null;
    }

    res.json(profileData);
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(error.name === 'CastError' ? 400 : 500).json({ error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie('token');
    res.status(200).json({ message: "User Logout Successfully" });
  } catch (error) {
    console.log(error);
  }
};