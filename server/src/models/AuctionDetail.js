import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const auctionDetailSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  playerStatus: {
    type: String,
    enum: ["sold", "unsold", "available"],
    default: "available",
  },
  startTime: {
    type: Date,
  },
  endTime: {
    type: Date
  },
  currentBid: {
    type: Number,
    default: 0
  },
  currentHighestBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  biddingHistory: [bidSchema],
  winningBid: {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    amount: {
      type: Number
    }
  }
}, {
  timestamps: true
});

// Method to place a bid
auctionDetailSchema.methods.placeBid = async function(team, amount) {
  if (amount <= this.currentBid) {
    throw new Error('Bid amount must be higher than current bid');
  }

  // Add bid to history
  this.biddingHistory.push({ team, amount });
  this.currentBid = amount;
  this.currentHighestBidder = team;

  // Extend auction only if it's still active
  if (this.endTime > Date.now()) {
    this.endTime = new Date(Date.now() + 30000);
  }

  await this.save();
  return this;
};

// Method to complete auction
auctionDetailSchema.methods.complete = async function() {
  const Player = mongoose.model('Player');
  const Team = mongoose.model('Team');

  const player = await Player.findById(this.player);
  
  if (this.currentHighestBidder) {
    this.playerStatus = 'sold';
    this.winningBid = {
      team: this.currentHighestBidder,
      amount: this.currentBid
    };

    if (player) {
      player.status = 'sold';
      player.team = this.currentHighestBidder;
      player.purchasePrice = this.currentBid;
      await player.save();
    }

    const team = await Team.findById(this.currentHighestBidder);
    if (team) {
      team.players.push(this.player);
      if (typeof team.updateRemainingBudget === "function") {
        await team.updateRemainingBudget();
      }
    }
  } else {
    this.playerStatus = 'unsold';
    if (player) {
      player.status = 'unsold';
      await player.save();
    }
  }

  await this.save();
  return this;
};

export default mongoose.model('AuctionDetail', auctionDetailSchema);