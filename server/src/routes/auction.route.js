import express from 'express';
import { createAuction, getAllAuctions, getAuctionById, updateAuctionStatus, sellPlayer, updateAuction } from '../controllers/auction.controller.js';
import { auth, adminOnly } from '../middleware/auth.js';
import { sendBidToKafka } from '../kafka/producer.js';

const router = express.Router();

router.post('/create', auth, adminOnly, createAuction);
router.get('/all-auctions', auth, getAllAuctions);
router.get('/:id', auth, getAuctionById);
router.patch('/:id/status', auth, adminOnly, updateAuctionStatus);
router.patch('/:id', auth, adminOnly, updateAuction);

// New POST /bid route
router.post('/bid', auth, async (req, res) => {
  try {
    const { auctionId, playerId, teamId, amount } = req.body;
    if (!auctionId || !playerId || !teamId || !amount) {
      return res.status(400).json({ error: 'Missing required bid fields' });
    }

    const bidData = {
      auctionId,
      playerId,
      teamId,
      amount,
      timestamp: new Date().toISOString()
    };

    // await sendBidToKafka(bidData);

    res.status(200).json({ success: true, message: 'Bid sent to Kafka', bid: bidData });
  } catch (error) {
    console.error('Error in /bid route:', error);
    res.status(500).json({ error: 'Failed to send bid to Kafka' });
  }
});

// New POST /sell-player route
router.post('/sell-player', auth, adminOnly, sellPlayer);


export default router;
