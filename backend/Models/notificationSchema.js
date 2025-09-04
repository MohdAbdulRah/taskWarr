const mongoose = require('mongoose')

const notiSchema = new mongoose.Schema({
    message : {type : String},
    gettime : {type : Date},
    checkedByUser : {
                type : Boolean,
                default : false
            }
})


const Notification = mongoose.model('Notification',notiSchema);
module.exports = Notification;
