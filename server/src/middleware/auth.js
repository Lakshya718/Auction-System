import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    let token = req.header('Authorization');
    
    if (!token) {
      console.log("token is not present");
      throw new Error('Authentication required');
    }

    // Handle both Bearer token and direct token
    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }
    console.log("Token received in auth middleware:", token);

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("JWT verification error:", err.message);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    console.log("Token decoded successfully");

    const user = await User.findById(decoded.userId).populate('team');
    console.log("User found:", user ? user.email : "No user");

    if (!user) {
      throw new Error('User not found');
    }

    console.log("Authenticated user role:", user.role);

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res.status(401).json({ error: 'Authentication required' });
  }
};

export const adminOnly = async (req, res, next) => {
  try {
    console.log(req.body);
    
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
