const mongoose = require('mongoose')
const passportLocalMongoose = require("passport-local-mongoose")

const userSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true
    },
    balance : {
        type : Number,
        default : 100
    },
    betsdone : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Bet"
        }
    ],
    betsgave : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Bet"
        }
    ],
    betstaken : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Bet" 
        }
    ],
    betsWinner : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Bet" 
        }
    ]
})

userSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User',userSchema);
module.exports = User;