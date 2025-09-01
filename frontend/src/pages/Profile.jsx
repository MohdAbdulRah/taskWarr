import React, { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { apiFetch } from "../utils/api";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const TABS = [
  { label: "Bets Taken", key: "betstaken" },
  { label: "Bets Done", key: "betsdone" },
  { label: "Bets Winner", key: "betsWinner" },
  { label: "Bets Gave", key: "betsgave" },
];

const Profile = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("betsgave");
  const navigate = useNavigate();
  const [failedTaskLoading,setFailedTaskLoading] = useState(false)

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
            className="rounded-2xl p-5 bg-white/30 backdrop-blur-md shadow-xl border border-white/40 hover:scale-[1.03] transition-all"
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

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#e0c3fc] via-[#8ec5fc] to-[#a9f1df] p-4">
      <Toaster position="top-right" richColors />
      <div className="max-w-6xl mx-auto mt-10 bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 border border-white/30">
       
      <div className="flex justify-between items-start mb-8">
  {/* Username & details */}
  <div className="text-center mx-auto">
    <h1 className="text-4xl font-extrabold text-purple-800 drop-shadow-md">{user.username}</h1>
    <p className="text-md text-gray-700 mt-2">
      Email: <span className="font-semibold">{user.email}</span>
    </p>
    <p className="text-md text-gray-700">
      Balance: ₹<span className="font-semibold">{user.balance}</span>
    </p>
  </div>

  {/* Failed Tasks Button */}
  <button
    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm md:text-md shadow-md transition-all
      ${
        failedTaskLoading
          ? "bg-gray-400/60 text-white cursor-not-allowed"
          : "bg-gradient-to-r from-pink-400 to-red-500 text-white hover:scale-105 hover:shadow-lg"
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
          

        
        {/* Tab buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-full font-semibold text-md transition duration-300 shadow-md
                ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white scale-105"
                    : "bg-white/50 text-gray-800 hover:bg-purple-100"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bets Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {renderBets(user[activeTab])}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
