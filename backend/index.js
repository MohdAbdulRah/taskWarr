const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config()
const Bet = require("./Models/betSchema.js");
const User = require("./Models/userSchema.js");
const Notification = require("./Models/notificationSchema.js");
const mongodb = process.env.MONGO_DB;
const cors = require('cors');

const session = require("express-session")
const MongoStore = require('connect-mongo');
const flash = require("connect-flash")
const passport = require("passport")
const LocalStratergy = require("passport-local")

const {isAuthenticated} = require("./Middleware/middlewares.js");
const { forEach } = require('mongoose/lib/helpers/specialProperties.js');

main()
.then(() => {
    console.log('Connected to MongoDB');
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(mongodb);
}
const app = express();

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true 
  }));

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
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized: true,
    cookie : {
        expires : Date.now() + 7*24*60*60*1000,
        maxAge : 7*24*60*60*1000,
        httpOnly : true
    }
}
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

app.post("/user/signup",async (req,res)=>{

    try {
        let {email,username,password} = req.body
        // console.log(email,username,password)
        const notification = new Notification({
            message : "Welcome To TaskWar Always Guarantee to issue Original Work to the Submitter. Free 100 Coins added to your Account",
            gettime : Date.now() 
        })
        await notification.save();
        
        const user1 = new User({
            email : email,
            username : username
        })
        user1.notifications.push(notification);
        const registeredUser = await User.register(user1,password)
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
app.listen(port,() => {
    console.log('Server is running on port 3000');
})

