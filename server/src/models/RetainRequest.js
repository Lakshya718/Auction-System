import mongoose from "mongoose";

const retainRequestSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    auction: { type: mongoose.Schema.Types.ObjectId, ref: "Auction", required: true },
    retainPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    requestedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const RetainRequest = mongoose.model("RetainRequest", retainRequestSchema);
export default RetainRequest;
