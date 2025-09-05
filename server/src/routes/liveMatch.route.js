import express from "express";
import {
  createLiveMatch,
  startMatch,
  recordBall,
  startNewOver,
  changeBatsman,
  getLiveMatch,
  getAllLiveMatches,
  getScorecard,
  deleteLiveMatch,
} from "../controllers/liveMatch.controller.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/all", getAllLiveMatches);
router.get("/:matchId/scorecard", getScorecard);
router.get("/:matchId", getLiveMatch);

// Protected routes (authentication required)
router.post("/create", auth, createLiveMatch);
router.put("/:matchId/start", auth, startMatch);
router.post("/:matchId/ball", auth, recordBall);
router.post("/:matchId/new-over", auth, startNewOver);
router.put("/:matchId/change-batsman", auth, changeBatsman);
router.delete("/:matchId", auth, deleteLiveMatch);

export default router;
