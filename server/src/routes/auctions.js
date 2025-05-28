import express from 'express';
import { createAuction, createAuctionDetail, startAuctionDetail, getAuctionDetail, cancelAuctionDetail, getAuctionDetails, getAllAuctions, removeTeamFromAuction, registerTeamToAuction } from '../controllers/auctionController.js';
import { auth, adminOnly, teamOwnerOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', auth, adminOnly, createAuction);
router.post('/', auth, adminOnly, createAuctionDetail);
router.get('/', auth, getAuctionDetails);
router.get('/all', auth, getAllAuctions);
router.get('/:id', auth, getAuctionDetail);
router.post('/:id/start', auth, adminOnly, startAuctionDetail);
router.post('/:id/cancel', auth, adminOnly, cancelAuctionDetail);

// New route to remove a team from an auction
router.delete('/:auctionId/team/:teamId', auth, adminOnly, removeTeamFromAuction);

// New route to register a team to an auction
router.post('/:id/register', auth, teamOwnerOnly, registerTeamToAuction);

// Placeholder route: live-auction common route for all authenticated users
router.get('/live-auction', auth, (req, res) => {
  res.json({ message: 'Placeholder: live-auction route for all authenticated users' });
});

// Placeholder route: live-auction for user role (view only)
router.get('/live-auction/user', auth, (req, res) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ error: 'Access denied: user role required' });
  }
  res.json({ message: 'Placeholder: live-auction route for user role (view only)' });
});

// Placeholder route: live-auction for team owner
router.get('/live-auction/team-owner', auth, teamOwnerOnly, (req, res) => {
  res.json({ message: 'Placeholder: live-auction route for team owner' });
});

// Placeholder route: live-auction for admin
router.get('/live-auction/admin', auth, adminOnly, (req, res) => {
  res.json({ message: 'Placeholder: live-auction route for admin' });
});

export default router;
