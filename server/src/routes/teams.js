import express from 'express';
import { getTeams, getTeam, updateTeam, getTeamPlayers, getMyTeam } from '../controllers/teamController.js';
import { auth, teamOwnerOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/all-teams', auth, getTeams);
router.get('/my-team', auth, teamOwnerOnly, getMyTeam);
router.get('/:id', auth, getTeam);
router.patch('teams/:id', auth, updateTeam);
router.get('/:id/players', auth, getTeamPlayers);

export default router;