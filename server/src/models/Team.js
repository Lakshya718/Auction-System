import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  teamLogo: {
    type: String,
    default: "https://t3.ftcdn.net/jpg/05/13/39/96/360_F_513399651_7X6aDPItRkVK4RtrysnGF8A88Gyfes3T.jpg"
  },

  teamDescription: {
    type: String,
  },

  budget: {
    type: Number,
    default: 150000000 
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }],

  remainingBudget: {
    type: Number,
    default: 150000000
  }
}, {
  timestamps: true
});

// Update remaining budget when adding/removing players
teamSchema.methods.updateRemainingBudget = async function() {
  const players = await mongoose.model('Player').find({
    _id: { $in: this.players }
  });
  
  const totalSpent = players.reduce((sum, player) => sum + (player.purchasePrice || 0), 0);
  this.remainingBudget = this.budget - totalSpent;
  await this.save();
};

export default mongoose.model('Team', teamSchema);