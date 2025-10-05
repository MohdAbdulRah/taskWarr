import React, { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { apiFetch } from "../utils/api";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";


const TABS = [
  { label: "Bets Taken", key: "betstaken" },
  { label: "Bets Done", key: "betsdone" },
  { label: "Bets Winner", key: "betsWinner" },
  { label: "Bets Gave", key: "betsgave" },
];
const BADGE_CONFIG = {
  Rookie:   { icon: "🌱", style: "bg-gradient-to-r from-green-400 to-green-600 text-white" },
  Beginner: { icon: "📘", style: "bg-gradient-to-r from-blue-400 to-blue-600 text-white" },
  Bronze:   { icon: "🥉", style: "bg-gradient-to-r from-orange-600 to-yellow-700 text-white" },
  Silver:   { icon: "🥈", style: "bg-gradient-to-r from-gray-300 to-gray-500 text-black" },
  Gold:     { icon: "🥇", style: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black" },
  Diamond:  { icon: "💎", style: "bg-gradient-to-r from-cyan-400 to-blue-500 text-white" },
  Legend:   { icon: "👑", style: "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white" },
};
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg border border-gray-700">
        <p className="font-semibold">{payload[0].name}</p>
        <p className="text-yellow-400">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const renderLegend = (props) => {
  const { payload } = props;
  return (
    <ul className="flex justify-center gap-4 mt-2">
      {payload.map((entry, index) => (
        <li key={`item-${index}`} className="flex items-center gap-1 text-white font-medium">
          <span
            style={{
              display: "inline-block",
              width: 12,
              height: 12,
              backgroundColor: entry.color,
              borderRadius: 3,
            }}
          ></span>
          {entry.value}
        </li>
      ))}
    </ul>
  );
};



const Profile = () => {
  const [user, setUser] = useState(null);
  const [showBadges, setShowBadges] = useState(false);
  const [activeTab, setActiveTab] = useState("betsgave");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [failedTaskLoading,setFailedTaskLoading] = useState(false)
  const [newEmail,setNewEmail] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiFetch("/user/me");
        setUser(data.user);
        // console.log(data.user[activeTab]);
      } catch (error) {
        toast.error("Failed to load profile.");
        console.error(error);
      }
    };

    fetchProfile();
  }, []);

  const renderBets = (bets) => {
    console.log("Render Bets:", bets);
    if (!bets || bets.length === 0) {
      return (
        <p className="text-center text-gray-400 font-medium mt-6">
          No bets found in this category.
        </p>
      );
    }

    

    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {bets.map((bet, i) => (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={i}
            onClick={() => navigate(`/bet/${bet._id}`)}
            className="rounded-2xl p-5 bg-white/80 backdrop-blur-md shadow-xl border border-white/40 hover:scale-[1.03] transition-all"
          >
            <h3 className="text-xl font-bold text-indigo-700">{bet.title}</h3>
            <p className="text-gray-700 mt-2">Amount: ₹{bet.amount}</p>
            <p className="text-sm text-gray-600">Status: {bet.status}</p>
          </motion.div>
        ))}
      </div>
    );
  };
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#f9fafc] to-[#e0e7ff]">
        <p className="text-xl text-gray-500 animate-pulse">Loading profile...</p>
      </div>
    );
  }

  const getWinLossData = () => {
    const totalWins = user.betsWinner ? user.betsWinner.length : 0;
    const totalLoss = user.betsdone ? user.betsdone.length - totalWins : 0;
  
    return [
      { name: "Wins", value: totalWins },
      { name: "Losses", value: totalLoss },
    ];
  };
  
  const getTaskData = () => {
    const totalCompleted = user.betsgave ? user.betsgave.filter(b => b.status === "success").length : 0;
    const totalNotCompleted = user.betsgave ? user.betsgave.length - totalCompleted : 0;
  
    return [
      { name: "Completed", value: totalCompleted },
      { name: "Not Completed", value: totalNotCompleted },
    ];
  };
  
  const COLORS = ["#4ade80", "#f87171"]; // green for success, red for failure
  

 
  
  const checkFailedTasks = async () => {
    console.log(failedTaskLoading)
      setFailedTaskLoading(true);
    console.log(failedTaskLoading)

      try{
        const data = await apiFetch("/task/check")
        toast.success(data.message)
         await new Promise(resolve => setTimeout(resolve,1000));
         window.location.reload();
      }
      catch(err){
        toast.error(err.message);
        console.error(err);
      }
      finally{
        setFailedTaskLoading(false);
      }
  }

  const handleSaveEmail = async () => {
    if(!newEmail) {
      toast.error("Email cannot be empty");
      return;
    }
    try {
      const data = await apiFetch("/save/email", {
        method: "POST",
        body: JSON.stringify({ email: newEmail }),
        headers: { "Content-Type": "application/json" },
      });
      toast.success(data.message);
      setUser((prev) => ({ ...prev, email: newEmail }));
    } catch (error) {
      toast.error("Failed to update email.");
      console.error(error);
    }
    finally{
      setShowModal(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
  {/* 🔹 Futuristic background */}
  <div
    className="absolute inset-0 bg-cover bg-center filter blur-sm scale-105"
    style={{
      backgroundImage:
        "url('/images/profilebg.jpg')", // apni profile ke liye ek cool gradient / abstract wallpaper
    }}
  />

  {/* 🔸 Dark overlay */}
  <div className="absolute inset-0 bg-black/50" />

  {/* 🔸 Main content */}
  <div className="relative z-10 p-4">
    <Toaster position="top-right" richColors />

    <div className="max-w-6xl mx-auto mt-12 bg-white/20 backdrop-blur-xl rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.4)] p-8 md:p-12 border border-white/30">
      {/* 🔹 Top Section */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-10">
        {/* Left side - Badges button */}
        <button
          onClick={() => setShowBadges(true)}
          className="px-5 py-2.5 rounded-full font-semibold text-sm md:text-md 
                    bg-gradient-to-r from-yellow-400 to-orange-500 text-white 
                    hover:scale-105 hover:shadow-lg transition-all order-3 lg:order-none"
        >
          Badges
        </button>
        {/* Username & details */}
        <div className="text-center flex-1 order-1 lg:order-none">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-500 drop-shadow-md">
            {user.username}
          </h1>
          <div className="text-md text-gray-100 mt-2">
      {user.email ? (
        <p>
          Email: <span className="font-semibold">{user.email}</span>
        </p>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md 
                     hover:bg-blue-700 transition duration-200"
        >
          Add Email
        </button>
      )}

      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-[90%] sm:w-[400px] shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-4">Add Email</h2>
            <input
              type="email"
              placeholder="Enter your email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEmail}
                className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

          {user.mobile && 
          <p className="text-md text-gray-100 mt-2">
            Mobile Number: <span className="font-semibold">{user.mobile}</span>
          </p>
          }
          
          <p className="text-md text-yellow-400 ">
            Balance: ₹<span className="font-semibold">{user.balance}</span>
          </p>
        </div>

        {/* Failed Tasks Button */}
        <button
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm md:text-md shadow-md transition-all order-2 lg:order-none
          ${
            failedTaskLoading
              ? "bg-gray-400/60 text-white cursor-not-allowed"
              : "bg-gradient-to-r from-pink-500 to-red-600 text-white hover:scale-105 hover:shadow-lg"
          }`}
          onClick={checkFailedTasks}
          disabled={failedTaskLoading}
        >
          {failedTaskLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
              Checking...
            </>
          ) : (
            "Failed Tasks"
          )}
        </button>
      </div>

      {/* 🔹 Tab buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-10">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-2.5 rounded-full font-semibold text-md transition duration-300 shadow-md
              ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white scale-105 shadow-[0_4px_20px_rgba(99,102,241,0.6)]"
                  : "bg-white/80 text-gray-900 hover:bg-purple-100"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 🔹 Bets Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {renderBets(user[activeTab])}
      </motion.div>
    </div>
  </div>
  {showBadges && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
    <div className="bg-gray-900 rounded-2xl p-6 w-[90%] sm:w-[500px] shadow-2xl relative">
      
      {/* Close Button */}
      <button
        onClick={() => setShowBadges(false)}
        className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
      >
        ✖
      </button>

      {/* Level / Rank Description */}
      {user.level && (
        <span className="absolute top-6 left-6 text-sm text-gray-300 font-medium uppercase tracking-wide">
          Level: {user.level}
        </span>
      )}

      {/* Title */}
      <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center">Your Badges</h2>

      {/* Badges */}
      {(!user.badges || user.badges.length === 0) ? (
        <p className="text-center text-gray-400 font-medium">No badges earned yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 justify-items-center">
          {user.badges.map((badge, i) => {
            const { icon, style } = BADGE_CONFIG[badge] || { icon: "🏆", style: "bg-gray-500 text-white" };
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`flex flex-col items-center justify-center px-4 py-5 rounded-xl shadow-lg w-28 h-28 ${style}`}
              >
                <div className="text-3xl">{icon}</div>
                <span className="mt-2 font-bold text-sm">{badge}</span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  </div>
)}

<div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
  {/* Wins/Losses */}
  <div className="bg-white/7 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/30">
    <h3 className="text-xl font-bold text-white mb-4 text-center">Task Taken Wins / Losses</h3>
    { getWinLossData().every(d => d.value === 0) ?
        <p className="text-center text-white font-medium mt-20">
        Do some tasks to see analytics 📊
      </p>
       : 
        
        <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={getWinLossData()}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label
          >
            {getWinLossData().map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
    <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
    }
  </div>

  {/* Tasks */}
  
  <div className="bg-white/7 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/30">
    <h3 className="text-xl font-bold text-white mb-4 text-center">Tasks Gave Completed / Not Completed</h3>
    {getTaskData().every(d => d.value === 0) ? (
    <p className="text-center text-white font-medium mt-20">
      Give some tasks to see analytics 📊
    </p>
  ) : (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={getTaskData()}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label
        >
          {getTaskData().map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={renderLegend} />
      </PieChart>
    </ResponsiveContainer>
  )}
  </div>
</div>


</div>

  );
};

export default Profile;
