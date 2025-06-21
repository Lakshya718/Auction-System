import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  purchasePrice: { type: Number },
  timestamp: { type: Date, default: Date.now },
});

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bio: { type: String },
    logo: { type: String },
    tournaments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Auction" }],
    players: [playerSchema],
  },
  { timestamps: true }
);

const Team = mongoose.model("Team", teamSchema);
export default Team;
