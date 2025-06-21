import express from 'express';
import { getTeams, getTeam, updateTeam, getTeamPlayers, getMyTeam } from '../controllers/team.controller.js';
import { auth, teamOwnerOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/all-teams', auth, getTeams);
router.get('/my-team', auth, teamOwnerOnly, getMyTeam);
router.get('/:id', auth, getTeam);
router.patch('/:id', auth, teamOwnerOnly, updateTeam); // Added teamOwnerOnly for security
router.get('/:id/players', auth, getTeamPlayers); //player are shown in getmyteam & getTeam

export default router;