import mongoose from "mongoose";

const handlePlayerSchema = new mongoose.Schema({
    player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        default: null,
    },
    status: {
        type: String,
        enum: ['available', 'sold', 'unsold'],
        default: 'available',
    }
}, {
    timestamps: true,
});

const auctionSchema = new mongoose.Schema({
    auctionName: {
        type: String,
        unique: true,
        required: true,
    },
    auctionDescription: {
        type: String,
    },
    auctionDate: {
        type: Date,
        required: true,
    },
    auctionStatus: {
        type: String,
        enum: ['pending', 'active', 'completed', 'cancelled'],
        default: 'pending'
    },
    auctionStartTime: {
        type: String,
        required: true,
        match: /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/ // Validates "HH:MM AM/PM" format
    },
    auctionEndTime: {
        type: String,
    },

    players: [handlePlayerSchema],

    teams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
    }],
    playerBasePrice: {
        type: Number,
        default: 2000000
    },
    teamTotalBudget: {
        type: Number,
        required: true,
        default: 150000000
    }
}, {
    timestamps: true,
});

auctionSchema.pre("save", function (next) {
    if (this.auctionStartTime) {
        const [time, period] = this.auctionStartTime.split(" ");
        let [hours, minutes] = time.split(":").map(Number);
        
        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;

        hours = (hours + 12) % 24;

        let newPeriod = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12; 

        this.auctionEndTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${newPeriod}`;
    }
    next();
});

export default mongoose.model('Auction', auctionSchema);