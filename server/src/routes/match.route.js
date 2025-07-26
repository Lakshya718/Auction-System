import express from 'express';
import { createMatch, getMatch, updateMatch ,getAllMatches} from '../controllers/match.controller.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/all-matches', auth, getAllMatches);
router.post('/create', auth, adminOnly, createMatch);
router.get('/:id', auth, getMatch);
router.patch('/update/:id', auth, adminOnly, updateMatch);

export default router;