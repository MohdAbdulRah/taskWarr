const mongoose = require('mongoose')

const betSchema = new mongoose.Schema({
    creator_id :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    acceptor_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    title : {
       type : String,
       required : true
    },
    description : {
        type : String
    },
    amount : {
        type : Number,
        required : true
    },
    winner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        default : null
    },
    status : {
         type : String,
         enum : ['pending','accepted','completed','success','failed','refunded'],
         default : 'pending'
    },
    proof : [
       {
        type : "String"
       } 
    
    ],
    original_amount : {
        type : Number,
        required : true
    },
    deadline : {
        type : Date,
        required : true
    },
    resolved_at : {
        type : Date
    }
    
},{timestamps : true})

const Bet = mongoose.model('Bet',betSchema);
module.exports = Bet;