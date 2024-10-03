const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    userId: { type: String, unique: true },
    score: { type: Number, default: 0 },
 electronic: { type: Number, default: 0 },
    deposit: [{
        package: String,
        details: String,
        electronic: Number,
        requestTime: Date
    }],
 withdrawals: {
        totalAmount: { type: Number, default: 0 },
        lastWithdrawalDate: { type: Date },
        history: [
            {
                amount: { type: Number, required: true },
                date: { type: Date, required: true }
            }
        ]
    },
    principalAmount: { type: Number, default: 0 },
    
    // Updated openPackages with new fields
    openPackages: [
        {
            packageCost: { type: Number, required: true },
            lastOpened: { type: Date, required: true },
            referredUserId: { type: String, required: false },
            isTodayRiched: { type: Boolean, default: false }, // Add the isTodayRiched field
            daysLeftFor90: { type: Number, default: 90 }, // নতুন ফিল্ড যোগ করা হয়েছে
            openedDate: { type: Date, required: true }, // Track when the package was opened
        }
    ]
});

const idgen = mongoose.model('idgen', userSchema);

module.exports = idgen;
