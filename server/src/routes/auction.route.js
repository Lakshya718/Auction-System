import express from 'express';
import { createAuction, getAllAuctions, getAuctionById, updateAuctionStatus } from '../controllers/auction.controller.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, adminOnly, createAuction);
router.get('/', auth, getAllAuctions);
router.get('/:id', auth, getAuctionById);
router.patch('/:id/status', auth, adminOnly, updateAuctionStatus);

export default router;