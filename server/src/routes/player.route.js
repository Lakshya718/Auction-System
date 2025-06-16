import express from "express";
import {
  getAllPendingPlayerRegistrationRequests, // Added
  reviewPendingPlayerRegistrationRequests, // Added
  getAllVerifiedPlayers, // Renamed from getAllPlayers
  getPlayer,
  updatePlayer,
  deletePlayer,
  createPlayerRequest,
  storePlayerInRedis,
  getPlayerFromRedis,
  deletePlayerFromRedis,
} from "../controllers/player.controller.js";
import { auth, adminOnly } from "../middleware/auth.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.post(
  "/registration-request",
  auth,
  adminOnly,
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "certificates", maxCount: 10 },
  ]),
  createPlayerRequest
);
router.get(
  "/pending-requests",
  auth,
  adminOnly,
  getAllPendingPlayerRegistrationRequests
); // Added
router.post(
  "/review-request",
  auth,
  adminOnly,
  reviewPendingPlayerRegistrationRequests
); // Added
router.get("/verified", auth, getAllVerifiedPlayers); // Renamed to reflect verified players
router.get("/:id", auth, getPlayer);
router.patch(
  "/:id",
  auth,
  adminOnly,
  upload.single("profilePhoto"),
  updatePlayer
); // Added upload for profile photo
router.delete("/:id", auth, adminOnly, deletePlayer);

// New routes for Redis player storage and retrieval
router.post("/redis/player", auth, storePlayerInRedis);
router.get("/redis/player/:id", auth, getPlayerFromRedis);
router.delete("/redis/player/:id",auth, deletePlayerFromRedis);

export default router;
