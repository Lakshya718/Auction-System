import mongoose from "mongoose";

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
  },
  { timestamps: true }
);

const Team = mongoose.model("Team", teamSchema);
export default Team;
