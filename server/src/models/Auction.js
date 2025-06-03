import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const auctionPlayerSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
  status: { type: String, enum: ["available", "sold", "unsold"], default: "available" },
  currentBid: { type: Number, default: 0 },
  currentHighestBidder: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  biddingHistory: [bidSchema],
  soldTo: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  soldPrice: { type: Number },
});

const teamBudgetSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  remainingBudget: { type: Number, required: true },
});

const auctionSchema = new mongoose.Schema(
  {
    tournamentName: { type: String, required: true, unique: true },
    description: { type: String },
    date: { type: Date, required: true },
    startTime: { type: String, required: true, match: /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/ },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled"],
      default: "pending",
    },
    players: [auctionPlayerSchema],
    retainedPlayers: [
      {
        player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
        team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
      }
    ],
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
    teamBudgets: [teamBudgetSchema],
    maxBudget: { type: Number, required: true },
    minBidIncrement: { type: Number, default: 500000 }, // ₹5 lakh default
  },
  { timestamps: true }
);


const Auction = mongoose.model("Auction", auctionSchema);
export default Auction;