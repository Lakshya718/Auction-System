import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    let token = req.header('Authorization');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    // Handle both Bearer token and direct token
    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new Error('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const adminOnly = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new Error('Admin access required');
    }
    next();
  } catch (error) {
    res.status(403).json({ error: 'Access denied' });
  }
};

export const teamOwnerOnly = async (req, res, next) => {
  try {
    if (req.user.role !== 'team_owner') {
      throw new Error('Team owner access required');
    }
    next();
  } catch (error) {
    res.status(403).json({ error: 'Access denied' });
  }
};
