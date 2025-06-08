import express from 'express';
import { getLiveBiddingData } from '../controllers/liveBidding.controller.js';

const router = express.Router();

// Route to get live bidding data for admin
router.get('/live-bidding', getLiveBiddingData);

export default router;
