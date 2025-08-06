import express from "express";
import {
  getTeams,
  getTeam,
  updateTeam,
  getTeamPlayers,
  getMyTeam,
} from "../controllers/team.controller.js";
import { auth, teamOwnerOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/all-teams", auth, getTeams);
router.get("/my-team", auth, teamOwnerOnly, getMyTeam);
router.get("/sport/:sport/teams", auth, async (req, res) => {
  try {
    const { sport } = req.params;

    // Import Team model inside the route handler to avoid circular dependencies
    const Team = (await import("../models/Team.js")).default;

    // Find teams filtered by sport
    const teams = await Team.find({ sport }).select("name logo sport");

    return res.status(200).json(teams);
  } catch (error) {
    console.error("Error fetching sport-specific teams:", error);
    return res.status(500).json({
      success: false,
      error: "Error fetching sport-specific teams",
    });
  }
});
router.get("/:id", auth, getTeam);
router.patch("/:id", auth, teamOwnerOnly, updateTeam); // Added teamOwnerOnly for security
router.get("/:id/players", auth, getTeamPlayers); //player are shown in getmyteam & getTeam

export default router;
