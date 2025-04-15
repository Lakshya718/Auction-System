import express from 'express';
import { createAuctionDetail, startAuctionDetail, getAuctionDetail, cancelAuctionDetail, getAuctionDetails } from '../controllers/auctionController.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, adminOnly, createAuctionDetail);
router.get('/', auth, getAuctionDetails);
router.get('/:id', auth, getAuctionDetail);
router.post('/:id/start', auth, adminOnly, startAuctionDetail);
router.post('/:id/cancel', auth, adminOnly, cancelAuctionDetail);

export default router;