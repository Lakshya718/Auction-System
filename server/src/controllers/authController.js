import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Team from '../models/Team.js';
import { uploadMedia, deleteMediaFromCloudinary } from '../utils/cloudinary.js';

const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = new User({ name, email, password, role });
    await user.save();

    if (role === 'team_owner') {
      const existingTeam = await Team.findOne({ teamName: name }); // Ensure teamName is set correctly
      if(existingTeam){
        return res.status(400).json({
          error: "team of this name already exists, login or enter a different team name.",
        });
      }

      const teamLogo = req.file; // Updated to use req.file
      let imageUrl = "https://t3.ftcdn.net/jpg/05/13/39/96/360_F_513399651_7X6aDPItRkVK4RtrysnGF8A88Gyfes3T.jpg"
      if(teamLogo){
        const cloudResponse = await uploadMedia(teamLogo.path); // Updated to use teamLogo.path
        console.log('Upload Response:', cloudResponse); // Logging the response for debugging
        imageUrl = cloudResponse.secure_url;
      }
      const updatedData = {
        teamName: name, // Ensure teamName is included
        name: name,
        teamLogo: imageUrl,
        owner: user._id,
      };
      const team = new Team(updatedData);
      await team.save();
      user.team = team._id;
      await user.save();
    }

    const token = generateAccessToken(user._id, user.role);

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log("user: ", user);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateAccessToken(user._id, user.role);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

    let team = null;
    if (user.role === 'team_owner') {
      team = await Team.findOne({ owner: user._id });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      team,
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user.role === 'team_owner') {
      const team = await Team.findOne({ owner: user._id });
      return res.json({ user, team });
    }
    res.json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
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
