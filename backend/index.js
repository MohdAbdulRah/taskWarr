const express = require('express');
const mongoose = require('mongoose');
const axios = require("axios");
require('dotenv').config()
const { GoogleGenerativeAI } = require("@google/generative-ai");
const http = require("http");
const { Server } = require("socket.io");
const Bet = require("./Models/betSchema.js");
const User = require("./Models/userSchema.js");
const Otp = require("./Models/otpSchema.js")
const Message = require("./Models/Message.js")
const Notification = require("./Models/notificationSchema.js");

const mongodb = process.env.MONGO_DB;
const cors = require('cors');


const session = require("express-session")
const MongoStore = require('connect-mongo');
const flash = require("connect-flash")
const passport = require("passport")
const LocalStratergy = require("passport-local")

const {isAuthenticated} = require("./Middleware/middlewares.js");


main()
.then(() => {
    console.log('Connected to MongoDB');
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(mongodb);
}


const app = express();


// yahan extra CORS dene ki zaroorat nahi


app.use(cors({
    origin: 'https://task-war-ep11.onrender.com', 
    // origin : true,
    credentials: true 
  }));

  const server = http.createServer(app);

// socket.io server
const io = new Server(server, {
  cors: {
    origin: "https://task-war-ep11.onrender.com",
    credentials: true
  }
});
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
  
    // join chat room
    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
    });
  
    // message bhejna aur receive karna
    socket.on("send_message", (data) => {
      io.to(data.roomId).emit("receive_message", data);
    });
  
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const store = MongoStore.create({
    mongoUrl : mongodb,
    crypto : {
        secret : process.env.SECRET
    },
    touchAfter : 24*60*60 //in seconds if in milliseconds 24*60*60*1000 but by default touchAfter is in seconds 
})

store.on("error",()=>{
    console.log("Some Error",err)
})
const secretOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
     httpOnly: true,
     secure: true,          // ✅ Render uses HTTPS, must be true
     sameSite: "none"  
    
    }
  };
app.set("trust proxy", 1);
app.use(session(secretOptions))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStratergy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())

app.get("/task/all",async (req,res) => {
    try{
        
        let query = { status: 'pending' };

        if (req.user && req.user.id) {
          query.creator_id = { $ne: req.user.id };
        }

        const Tasks = await Bet.find(query).populate("creator_id").populate("acceptor_id").populate("winner");
        res.status(200).json({message : "Successfully Fetched the Tasks",success : true,tasks : Tasks})
    }
    catch(error){
        res.status(400).json({message : error.message || 'Something wrong while fetching bets',success : false})
    }
   

})

app.get("/task/check",isAuthenticated,async (req,res) => {
    try{
        const Bets = await Bet.updateMany(
            { deadline: { $lt: Date.now() },creator_id : req.user.id}, // filter tasks with expired deadlines
            { $set: { status: 'failed' } }                         // update status to 'failed'
          );

          res.status(200).json({message : "Checked Succesfully",success : false,failedTasks : Bets})
    }
    catch(error){
        res.status(400).json({message : error.message || 'Something wrong while Checking bets',success : false})
    }
  


})
app.post("/task/bet",isAuthenticated,async (req,res) => {
    const {acceptor_id,title,description,amount,deadline} = req.body;
    try{
       if(amount > req.user.balance){
         return res.status(400).json({message : `Cannot Create a Task of ${amount} more than your user balance ${req.user.balance}`,success : false});
       }
       const Task = new Bet({
           creator_id : req.user,
           acceptor_id,
           title,
           description,
           amount,
           original_amount : amount,
           deadline
        })
        await Task.save();
        const notification = new Notification({
         message : `Task ${Task.title} has been created with amount Rs.${Task.amount}`,
         gettime : Date.now() 
       })
        await notification.save();

       const user = req.user;
       user.balance = user.balance - amount;
       user.notifications.push(notification)
       console.log(Task.id);
       user.betsgave.push(new mongoose.Types.ObjectId(Task.id));
       await user.save();

       res.status(200).json({message : "Created the Task",success : true,task : Task});
    }
    catch(error){
        res.status(400).json({message : error.message || "Error in Creating the Task",success : false});
    }
})
app.get("/task/:taskid",isAuthenticated,async(req,res) => {
    try {
        const {taskid} = req.params;
        const Task = await Bet.findOne({
            _id: new mongoose.Types.ObjectId(taskid),
           
          })
          .populate("creator_id")
          .populate("acceptor_id")
          .populate("winner");

        return res.status(200).json({message : "Task Fetched Successfully",success : true,task : Task});
    }
    catch(error){
        res.status(400).json({message : error.message || "Error in Fetching the Task",success : false});
    }
})
app.get("/task/accept/:taskid",isAuthenticated,async (req,res) => {
    try{
        const {taskid} = req.params;
        const Task = await Bet.findOne({
            _id: new mongoose.Types.ObjectId(taskid),
            creator_id: { $ne: new mongoose.Types.ObjectId(req.user.id) }
          });

          const user = req.user;
          if(Task.amount > user.balance){
            return res.status(400).json({message :  "Your balance is less than the task amount to bet",success : false})
          }
        // console.log(Task);
        if(Task == null){
            return res.status(400).json({message :"You cant accept your own task",success : false});
        }
        if(Task.status == 'failed'){
            return res.status(400).json({message :"This task deadline is over you cant accept this task",success : false});
        }
        const notification = new Notification({
            message :`Task ${Task.title} has been Accepted of Amount Rs.${Task.original_amount}`,
            gettime : Date.now() 
        })
        await notification.save();
        user.betstaken.push(new mongoose.Types.ObjectId(Task.id));
        user.notifications.push(notification)
        user.balance = user.balance - Task.amount;
        await user.save();

        Task.status = 'accepted';
        Task.acceptor_id = new mongoose.Types.ObjectId(req.user.id);
        Task.amount = Task.amount * 2;
        await Task.save();

        const creatorUser = await User.findOne({
            _id : Task.creator_id
        })
        const notification1 = new Notification({
            message :`Your Task ${Task.title} of amount Rs.${Task.original_amount} has been accepted By @${user.username}`,
            gettime : Date.now() 
        })
        await notification1.save();
        creatorUser.notifications.push(notification1)

        await creatorUser.save();
       
       
       res.status(200).json({message : "Accepted the Task",success : true,task : Task});
    }
    catch(error){
        res.status(400).json({message : error.message || "Error in Accepting the Task",success : false});
    }
})

app.post("/save/email",isAuthenticated,async (req,res) => {
  const {email} = req.body;
  try{
    const user = req.user;
    user.email = email;
    await user.save();

    res.status(200).json({success : true,message : "Email Saved Successfully",user : user});
  }
  catch(error){
    return res.status(400).json({message : error.message || "Error in Saving the Email",success : false});
  }


})

app.get("/task/refund/:taskid",isAuthenticated,async (req,res) => {
    try{
        const {taskid} = req.params;
        const failedTasks = await Bet.findOne({
            status: "failed",
            _id : new mongoose.Types.ObjectId(taskid)
        });
        // console.log(failedTasks);
        if(!failedTasks){
            return res.status(400).json({message : "Task Either not Exists or it is not failed",success : false});
        }
        const user = await User.findById(req.user._id);
        if(failedTasks.creator_id.toString() !== req.user._id.toString()){
            return res.status(400).json({message : "You are not the owner of this task",success : false});
        }
        const notification = new Notification({
            message :`Task ${failedTasks.title} of Amount Rs.${failedTasks.original_amount} has been refunded to your Account`,
            gettime : Date.now() 
        })
        await notification.save();
        
        user.notifications.push(notification)
        user.balance += failedTasks.amount;
        await user.save();

        failedTasks.amount = 0;
        failedTasks.status = 'refunded';
        await failedTasks.save();

        return res.status(200).json({ message: "Amount refunded successfully", success: true });
    }
    catch(error){
        res.status(400).json({message : error.message || "Error in Refunding the Task Please try again later",success : false});
    }
    
})




app.post("/task/done/:taskid",isAuthenticated,async (req,res) => {
    try{
        const {taskid} = req.params;
        const {proof} = req.body;
       const fileUrl = proof;
        console.log(fileUrl);
        const Task = await Bet.findOne({
            _id: new mongoose.Types.ObjectId(taskid),
            status : 'accepted',
            creator_id: { $ne: new mongoose.Types.ObjectId(req.user.id) }
        });
        
        if(Task == null){
            return res.status(400).json({message :  "Cant Find the Task Please try again later",success : false});
        }
        if(Task.acceptor_id.toString() !== req.user._id.toString()){
            return res.status(400).json({message : "You are not the acceptor of this task",success : false});
        }

        const {title,description} = Task;
        console.log(title,description)
        Task.proof = proof;
        Task.status = 'completed';
        Task.resolved_at = Date.now();
        Task.amount = Task.amount/2;
        await Task.save();

        const notification = new Notification({
            message :`Task ${Task.title} has been Done by You and Your Amount rs.${Task.original_amount} Associated with this task has been added to your account and the remaining will be added once the creator verifies your work`,
            gettime : Date.now() 
        })
        await notification.save();

        const user = await User.findOne({_id: new mongoose.Types.ObjectId(req.user._id)})
        user.betsdone.push(new mongoose.Types.ObjectId(Task.id));
        user.balance = user.balance + Task.amount;
        user.notifications.push(notification)
        await user.save();


        const notification1 = new Notification({
            message :`Your Task ${Task.title} has been Done By @${user.username} Please Verify The User work`,
            gettime : Date.now() 
        })
        await notification1.save();
        const creatorUser = await User.findOne({
            _id : Task.creator_id
        })
        creatorUser.notifications.push(notification1)
        await creatorUser.save();
        return res.status(200).json({message : "Task Completed",success : true,task : Task});
    }
    catch(error){
        res.status(400).json({message : error.message || "Error in Completing the Task Please try again later",success : false});
    }
})
const badgeMilestones = {
  1: "Rookie",
  5: "Beginner",
  10: "Bronze",
  25: "Silver",
  50: "Gold",
  100: "Diamond",
  200: "Legend",
};
async function updateUserBadges(userId) {
  const user = await User.findById(userId).populate("betsWinner");

  if (!user) return null;

  const betsCount = user.betsWinner.length;

  // Level system (optional – 1 level per 10 bets)
  user.level = Math.floor(betsCount / 10) + 1;

  // Badge check
  Object.keys(badgeMilestones).forEach((milestone) => {
    if (user.level >= milestone && !user.badges.includes(badgeMilestones[milestone])) {
      user.badges.push(badgeMilestones[milestone]);
    }
  });

  await user.save();
  return user;
}

app.get("/task/verify/:taskid",async (req,res) => {
    try{
        const {taskid} = req.params;
        const Task = await Bet.findOne({
            _id: new mongoose.Types.ObjectId(taskid),
            status : 'completed'
        }).populate("acceptor_id");

        if(Task == null){
            return res.status(400).json({message : "Still the Task is not completed",success : false});
        }
        const user = await User.findOne({_id: new mongoose.Types.ObjectId(req.user._id)})

        if(Task.creator_id.toString() !== req.user._id.toString()){
            return res.status(400).json({message : "You are not the owner of this task",success : false});
        }
        

        const completor = await User.findOne({_id : new mongoose.Types.ObjectId(Task.acceptor_id.id)})
        completor.balance += Task.amount;
        Task.amount = 0;
        Task.winner = completor;
        completor.betsWinner.push(new mongoose.Types.ObjectId(Task.id));
        Task.status = 'success';

        const notification = new Notification({
            message :`Amount Associated with your Task ${Task.title} has been recieved by @${completor.username}`,
            gettime : Date.now() 
        })
        await notification.save();
        const notification1 = new Notification({
            message :`Hurray Task ${Task.title} which has been completed by you Is Right and is verified by the user @${user.username} and the Task Amount ${Task.original_amount} has been funded to your account`,
            gettime : Date.now() 
        })
        await notification1.save();


        user.notifications.push(notification)
        completor.notifications.push(notification1)
        await Task.save();
        await completor.save();
       await user.save();

       const updatedUser = await updateUserBadges(completor._id);

        res.status(200).json({message : "Successfully Done the task",success : true,task : Task});

    }
    catch(error){
        res.status(400).json({message : error.message || "Error in Verifying the Task Please try again later",success : false});
    }
})
app.get("/task/unverify/:taskid",async (req,res) => {
    try{
        const {taskid} = req.params;
        const Task = await Bet.findOne({
            _id: new mongoose.Types.ObjectId(taskid),
            status : 'completed'
        }).populate("acceptor_id");

        if(Task == null){
            return res.status(400).json({message : "Still the Task is not completed",success : false});
        }
        const completor = await User.findOne({_id : new mongoose.Types.ObjectId(Task.acceptor_id.id)})
        const user = await User.findOne({_id: new mongoose.Types.ObjectId(req.user._id)})

        if(Task.creator_id.toString() !== req.user._id.toString()){
            return res.status(400).json({message : "You are not the owner of this task",success : false});
        }

        user.balance += Task.amount;        
        Task.amount = 0;
        Task.status = 'refunded';

        const notification = new Notification({
            message :`Amount Associated with your Task ${Task.title} Done By @${completor.username} has been Funded back to you`,
            gettime : Date.now() 
        })
        await notification.save();
        const notification1 = new Notification({
            message :`Bad Newz Task ${Task.title} which has been completed by you Is Wrong and is verified by the user @${user.username} and the Task Amount ${Task.original_amount} has been funded back to his account`,
            gettime : Date.now() 
        })
        await notification1.save();

        user.notifications.push(notification)
        completor.notifications.push(notification1)
        await Task.save();
        await user.save();
        await completor.save();

        res.status(200).json({message : "Successfully Failed the task",success : true,task : Task});

    }
    catch(error){
        res.status(400).json({message : error.message || "Error in Verifying the Task Please try again later",success : false});
    }
})

app.post("/auth/send-otp", async (req, res) => {
    const { mobile } = req.body;
    if(mobile.length != 10){
       return res.json({ success: false, message: "Invalid Mobile Number"}); 
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
    await Otp.create({
      mobile,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 min
    });
  
    console.log(`OTP for ${mobile}: ${otp}`); // send via SMS gateway
    // console.log("API KEY =>", process.env.FAST2SMS_API_KEY);
    // const response = await axios.get(
    //   `https://2factor.in/API/V1/${process.env.FAST2SMS_API_KEY}/SMS/${mobile}/${otp}/OTP1`
    // );
    // console.log(response.data);
    res.json({ success: true, message: "OTP sent" });
  });
  

app.post("/user/signup",async (req,res)=>{

    try {
        let {mobile,otp,username,password} = req.body
        // console.log(email,username,password)
        const otpDoc = await Otp.findOne({ mobile, otp });
        if (!otpDoc || otpDoc.expiresAt < Date.now()) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }
        const notification = new Notification({
            message : "Welcome To TaskWar Always Guarantee to issue Original Work to the Submitter. Free 100 Coins added to your Account",
            gettime : Date.now() 
        })
        await notification.save();
        const user = await User.findOne({mobile : mobile})
        if(user){
            return res.status(400).json({ success: false, message: "Mobile Already exists for a User" });
        }
        const user1 = new User({
            mobile : mobile,
            username : username
        })
        user1.notifications.push(notification);
        const registeredUser = await User.register(user1,password)
        await Otp.deleteMany({ mobile });
        req.login(registeredUser,(err)=>{
            if(err){
                return next(err);
            }
            
            res.status(200).json({message : "You are successfully signed up and logged In",success : true,user : registeredUser});
        })
       
    }
    catch(err){
        res.status(400).json({message : err.message || "Some Error in Signing Up",success : false});
    }
    
})

app.post('/user/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return res.status(400).json({
          message: err.message || 'Some Error in Signing Up',
          success: false
        });
      }
  
      if (!user) {
        return res.status(400).json({
          message: info.message || 'Invalid credentials',
          success: false
        });
      }
  
      // Log the user in
      req.logIn(user, (err) => {
        if (err) {
          return res.status(400).json({
            message: err.message || 'Login failed',
            success: false
          });
        }
  
        // Successfully logged in
        return res.status(200).json({
          message: 'You are successfully signed up and logged In',
          success: true,
          user: user
        });
      });
    })(req, res, next);
  });
  
  app.get('/user/me', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        .populate("betsdone")
        .populate("betsgave")
        .populate("betstaken")
        .populate("betsWinner")
        .populate("notifications");
        
  
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      
  
      res.status(200).json({ success: true, user });
    } catch (err) {
      console.error("Error populating user:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.get("/user/notifications",isAuthenticated, async (req, res) =>{
    try {
        const user = await User.findById(req.user._id)
        .populate("notifications");
        
  
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      
      // ✅ Update all notifications -> checkedByUser = true
    await Notification.updateMany(
        { _id: { $in: user.notifications } },
        { $set: { checkedByUser: true } }
      );
  
      // ✅ Re-fetch notifications after update
      const updatedUser = await User.findById(req.user._id)
        .populate({
            path : "notifications",
            options : {sort : {gettime : -1}}
        });
  
      res.status(200).json({ success: true, notifications: updatedUser.notifications });
    } catch (err) {
      console.error("Error populating user:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  })
  
  app.get("/user/:username",isAuthenticated,async (req,res) => {
     try{
        const user = await User.findOne({username : req.user.username });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
          }
      
         res.status(200).json({ success: true, user });
     }
     catch(error){
        console.error("Error populating user:", err);
        res.status(500).json({ success: false, message: "Server error" });
     }
  })
  
  // Top Winners API
app.get("/top-winners", async (req, res) => {
    try {
      const users = await User.find()
        .populate("betsWinner") // betsWinner array ke andar Bet documents aa jayenge
        .lean();
  
      const usersWithSum = users.map(user => {
        const totalWinAmount = (user.betsWinner || []).reduce((sum, bet) => {
          return sum + (bet.original_amount || 0); // Bet model ka field use kar rahe hain
        }, 0);
  
        return {
          _id: user._id,
          username: user.username,
          totalWinAmount
        };
      });
  
      const topUsers = usersWithSum
        .sort((a, b) => b.totalWinAmount - a.totalWinAmount)
        .slice(0, 10);
  
      res.json({ success: true, users: topUsers });
    } catch (err) {
      console.error("Error fetching top winners:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });
  
  app.get("/top-winners-by-level", async (req, res) => {
    try {
      const users = await User.find()
        .populate("betsWinner")
        .select("username level betsWinner")
        .lean();
  
      const usersWithScore = users.map(user => {
        const totalWinAmount = (user.betsWinner || []).reduce((sum, bet) => {
          return sum + (bet.original_amount || 0);
        }, 0);
  
        return {
          _id: user._id,
          username: user.username,
          level: user.level,
          totalWinAmount
        };
      });
  
      // Sort: Level first, then totalWinAmount
      const topUsers = usersWithScore
        .sort((a, b) => {
          if (b.level === a.level) {
            return b.totalWinAmount - a.totalWinAmount; // tie → higher winnings
          }
          return b.level - a.level; // higher level first
        })
        .slice(0, 10);
  
      res.json({ success: true, users: topUsers });
    } catch (err) {
      console.error("Error fetching top winners by level:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });
  
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  app.post("/ask", async (req, res) => {
    try {
      const { prompt, history } = req.body;
      if (!prompt) return res.status(400).json({ error: "Missing prompt" });
  
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-preview-09-2025",
      });
  
      // 🧠 1️⃣ Define the Task Coach persona/system prompt
      const systemPrompt = `
  You are "Task Coach", the official AI mentor of the productivity platform TaskWar.
  Your tone is motivational, friendly, and energetic — like a gaming coach helping warriors conquer tasks.
  You use fun metaphors (battle, victory, XP, focus energy) but also give practical productivity advice.
  
  Rules:
  - Keep replies short (2–5 sentences).
  - Always include one actionable suggestion or plan.
  - Celebrate wins with energy (🔥🏆⚔️✅).
  - If the user seems demotivated, encourage them with empathy.
  - Avoid robotic tone, sound like a companion warrior or trainer.
  - You can use light emojis sparingly to make chat lively.
  `;
  
      // 🗂️ 2️⃣ Safely map history
      const formattedHistory = Array.isArray(history)
        ? history.map((h) => ({
            role: h.role === "assistant" ? "model" : "user",
            parts: [{ text: h.content || "" }],
          }))
        : [];
  
      // 🧩 3️⃣ Inject system prompt at the beginning of the history
      formattedHistory.unshift({
        role: "user", // Gemini doesn’t have "system", so we feed it as first "user" context
        parts: [{ text: systemPrompt }],
      });
  
      // 💬 4️⃣ Start chat session
      const chat = model.startChat({
        history: formattedHistory,
        generationConfig: { maxOutputTokens: 500 },
      });
  
      // 🎯 5️⃣ Send user’s message
      const result = await chat.sendMessage(prompt);
  
      // 🧾 6️⃣ Parse response safely
      let reply = "";
      if (result?.response?.candidates?.length > 0) {
        reply =
          result.response.candidates[0].content?.parts
            ?.map((p) => p?.text || "")
            .join("\n") || "";
      } else if (typeof result?.response?.text === "function") {
        reply = result.response.text();
      }
  
      reply = reply?.trim() || "Model did not return any response.";
  
      res.json({ reply });
    } catch (error) {
      console.error("GENAI ERROR:", error);
      res.status(500).json({
        error:
          error.message ||
          "Something went wrong while fetching AI response.",
        fallback: "Please try again later.",
      });
    }
  });
  
  app.post("/messages", async (req, res) => {
    try {
      const { sender, receiver, content, roomId } = req.body;
  
      if (!sender || !receiver || !content) {
        return res.status(400).json({ error: "sender, receiver, and content are required" });
      }
  
      // Save message
      const message = new Message({
        sender: new mongoose.Types.ObjectId(sender),
        receiver: new mongoose.Types.ObjectId(receiver),
        content,
        roomId: roomId || null
      });
      await message.save();
  
      // Fetch sender details (username)
      const senderUser = await User.findById(sender).select("username");
  
      // Create notification document
      const notification = new Notification({
        message: `New message from ${senderUser?.username || "Unknown"}`,
        gettime: Date.now(),
        checkedByUser: false
      });
      await notification.save();
  
      // Push notification reference into receiver's notifications
      await User.findByIdAndUpdate(
        receiver,
        { $push: { notifications: notification._id } },
        { new: true }
      );
  
      res.json({ success: true, message });
    } catch (error) {
      console.error("Message Save Error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  
// GET all users except the logged-in user
app.get("/all-users", isAuthenticated, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select("_id username");
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});


// Get chat between two users (or related to a task)
app.get("/messages/:user1/:user2", async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    }).sort({ createdAt: 1 }); // oldest first

    res.json(messages);
  } catch (error) {
    console.error("Fetch messages error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get chat list (all users I have chatted with)
app.get("/chat-list", async (req, res) => {
  try {
    const userId = req.user._id; // logged-in user

    // Find all messages where I'm either sender or receiver
    const messages = await Message.find({
      $or: [
        { sender: userId },   // I sent
        { receiver: userId }  // I received
      ]
    })
      .sort({ createdAt: -1 })
      .populate("sender", "username")
      .populate("receiver", "username");

    const chatUsers = [];
    const seen = new Set();

    messages.forEach(msg => {
      let other;
      // If I am sender → other = receiver
      if (msg.sender._id.toString() === userId.toString()) {
        other = msg.receiver;
      } 
      // If I am receiver → other = sender
      else {
        other = msg.sender;
      }

      if (!seen.has(other._id.toString())) {
        seen.add(other._id.toString());
        chatUsers.push(other);
      }
    });

    res.json({ success: true, users: chatUsers });
  } catch (err) {
    console.error("Chat list error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch chat list" });
  }
});



  
app.get('/user/logout',isAuthenticated,(req,res)=>{
    req.logout((err)=>{
        if(err){
            return res.status(400).json({
                message: err.message || 'Logout failed',
                success: false
              });
        }

        res.status(200).json({message : "Successfully Logged out",success : true})
    })
})

const port = process.env.PORT || 3000;
server.listen(port,() => {
    console.log('Server is running on port 3000');
})

