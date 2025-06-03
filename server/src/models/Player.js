import mongoose from 'mongoose';
import cron from 'node-cron'; 

const playerSchema = new mongoose.Schema({
  playerName: {
    type: String,
    required: true,
    trim: true
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
    required: true
  },
  playerRole: {
    type: String,
    enum: ['batsman', 'pace-bowler', 'medium-pace-bowler', 'spinner', 'batting all-rounder', 'bowling all-rounder', 'wicket-keeper'],
    required: true
  },
  profilePhoto: {
    type: String,
    default: "https://media.istockphoto.com/id/1961226379/vector/cricket-player-playing-short-concept.jpg?s=612x612&w=0&k=20&c=CSiQd4qzLY-MB5o_anUOnwjIqxm7pP8aus-Lx74AQus="
  },
  battingStyle: {
    type: String,
    enum: ['right-handed', 'left-handed'],
    required: true
  },
  bowlingStyle: {
    type: String,
    enum: ['right-arm-fast', 'right-arm-medium', 'right-arm-off-spin', 
           'left-arm-fast', 'left-arm-medium', 'left-arm-spin', 'none'],
    default: 'none'
  },

  playingExperience: {
    type: Number,
    default: 0,
  },

  country: {
    type: String,
    required: true
  },
  
  basePrice: {
    type: Number,
    required: true
  },
  
  stats: {
    matches: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    average: { type: Number, default: 0 },
    strikeRate: { type: Number, default: 0 },
    economy: { type: Number, default: 0 }
  },

  status: {
    type: String,
    enum: ["verified", "pending"],
    default: "pending",
  },

  certificates: [{
    type: String,
  }],

  description: {
    type: String,
  },
}, {
  timestamps: true,
});

const Player = mongoose.model('Player', playerSchema);

const incrementPlayerAge = async () => {
  try {
    const result = await Player.updateMany({}, { $inc: { age: 1 } }); // Increment age by 1
    console.log(`Incremented age for ${result.modifiedCount} players.`);
  } catch (error) {
    console.error('Error incrementing player age:', error);
  }
};

// Run every year on January 1st at midnight to increase age
cron.schedule('0 0 1 1 *', () => {
  console.log('Running scheduled job to increment players\' age...');
  incrementPlayerAge();
});

export default Player;
