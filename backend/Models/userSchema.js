const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String  
    },
    mobile: {
        type: String,
        required: true,
        unique: true  // ek hi mobile ek user ke liye
    },
    balance: {
        type: Number,
        default: 100
    },
    betsdone: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bet"
        }
    ],
    betsgave: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bet"
        }
    ],
    betstaken: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bet" 
        }
    ],
    betsWinner: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bet" 
        }
    ],
    notifications: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Notification"
        }
    ],
    badges: [{ type: String }],
    level: { type: Number, default: 1 }
});

// yeh plugin password hash + salt add karega
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);
module.exports = User;
