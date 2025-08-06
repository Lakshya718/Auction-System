import mongoose from "mongoose";
import cron from "node-cron";

const playerSchema = new mongoose.Schema(
  {
    playerName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    sport: {
      type: String,
      enum: ["cricket", "football", "basketball", "volleyball", "kabaddi"],
      required: true,
      default: "cricket",
    },
    playerRole: {
      type: String,
      required: true,
    },
    profilePhoto: {
      type: String,
      default:
        "https://www.shutterstock.com/image-vector/illustration-batsman-playing-cricket-action-600nw-2506131549.jpg",
    },

    // Cricket specific fields
    battingStyle: {
      type: String,
      enum: ["right-handed", "left-handed", "not-applicable"],
      default: "not-applicable",
    },
    bowlingStyle: {
      type: String,
      enum: [
        "right-arm-fast",
        "right-arm-medium",
        "right-arm-off-spin",
        "left-arm-fast",
        "left-arm-medium",
        "left-arm-spin",
        "none",
      ],
      default: "none",
    },

    // Football specific fields
    footedness: {
      type: String,
      enum: ["right", "left", "both", "not-applicable"],
      default: "not-applicable",
    },

    // Basketball specific fields
    height: {
      type: Number, // in cm
      default: 0,
    },
    wingspan: {
      type: Number, // in cm
      default: 0,
    },

    playingExperience: {
      type: Number,
      default: 0,
    },

    country: {
      type: String,
      required: true,
    },

    basePrice: {
      type: Number,
      required: true,
    },

    // Sport-specific stats schemas
    cricketStats: {
      matches: { type: Number, default: 0 },
      runs: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      average: { type: Number, default: 0 },
      strikeRate: { type: Number, default: 0 },
      economy: { type: Number, default: 0 },
    },

    footballStats: {
      matches: { type: Number, default: 0 },
      goals: { type: Number, default: 0 },
      assists: { type: Number, default: 0 },
      cleanSheets: { type: Number, default: 0 },
      yellowCards: { type: Number, default: 0 },
      redCards: { type: Number, default: 0 },
    },

    basketballStats: {
      matches: { type: Number, default: 0 },
      points: { type: Number, default: 0 },
      rebounds: { type: Number, default: 0 },
      assists: { type: Number, default: 0 },
      steals: { type: Number, default: 0 },
      blocks: { type: Number, default: 0 },
    },

    volleyballStats: {
      matches: { type: Number, default: 0 },
      points: { type: Number, default: 0 },
      aces: { type: Number, default: 0 },
      blocks: { type: Number, default: 0 },
      digs: { type: Number, default: 0 },
      assists: { type: Number, default: 0 },
    },

    kabaddiStats: {
      matches: { type: Number, default: 0 },
      raidPoints: { type: Number, default: 0 },
      tacklePoints: { type: Number, default: 0 },
      allOutPoints: { type: Number, default: 0 },
      superRaids: { type: Number, default: 0 },
      superTackles: { type: Number, default: 0 },
    },

    status: {
      type: String,
      enum: ["verified", "pending"],
      default: "pending",
    },

    certificates: [
      {
        type: String,
      },
    ],

    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// This function validates that the playerRole is appropriate for the selected sport
playerSchema.pre("save", function (next) {
  const validRoles = {
    cricket: [
      "batsman",
      "pace-bowler",
      "medium-pace-bowler",
      "spinner",
      "batting all-rounder",
      "bowling all-rounder",
      "wicket-keeper",
    ],
    football: [
      "goalkeeper",
      "defender",
      "midfielder",
      "forward",
      "striker",
      "winger",
      "center-back",
      "full-back",
    ],
    basketball: [
      "point-guard",
      "shooting-guard",
      "small-forward",
      "power-forward",
      "center",
    ],
    volleyball: [
      "setter",
      "outside-hitter",
      "opposite",
      "middle-blocker",
      "libero",
    ],
    kabaddi: ["raider", "defender", "all-rounder", "corner", "cover"],
  };

  if (!validRoles[this.sport].includes(this.playerRole)) {
    return next(
      new Error(
        `Invalid player role "${this.playerRole}" for sport "${this.sport}"`
      )
    );
  }

  next();
});

const Player = mongoose.model("Player", playerSchema);

const incrementPlayerAge = async () => {
  try {
    const result = await Player.updateMany({}, { $inc: { age: 1 } }); // Increment age by 1
    console.log(`Incremented age for ${result.modifiedCount} players.`);
  } catch (error) {
    console.error("Error incrementing player age:", error);
  }
};

// Run every year on January 1st at midnight to increase age
cron.schedule("0 0 1 1 *", () => {
  console.log("Running scheduled job to increment players' age...");
  incrementPlayerAge();
});

export default Player;
