const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  roomId: { type: String },  // optional
  task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: null }
},{timestamps : true});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
