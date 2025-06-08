import express from 'express';
import { createAuction, getAllAuctions, getAuctionById, updateAuctionStatus } from '../controllers/auction.controller.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', auth, adminOnly, createAuction);
router.get('/all-auctions', auth, getAllAuctions);
router.get('/:id', auth, getAuctionById);
router.patch('/:id/status', auth, adminOnly, updateAuctionStatus);

export default router;