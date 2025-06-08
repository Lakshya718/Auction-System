import express from 'express';
import { createMatch, getMatch, updateMatch } from '../controllers/match.controller.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', auth, adminOnly, createMatch);
router.get('/:id', auth, getMatch);
router.patch('/:id', auth, adminOnly, updateMatch);

export default router;