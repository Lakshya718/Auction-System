import express from 'express';
import { getAllPlayers, getPlayer, createPlayer } from '../controllers/playerController.js';
import { auth } from '../middleware/auth.js';
import upload from '../utils/multer.js';

const router = express.Router();

router.get('/all', auth, getAllPlayers);
router.get('/:id', auth, getPlayer);
router.post('/add-player', auth, upload.single('profilePhoto'), createPlayer);

export default router;
