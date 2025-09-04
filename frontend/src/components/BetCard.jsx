import React, { useEffect, useState } from "react";
import { FaTrophy, FaUser, FaMoneyBillWave, FaClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import { toast } from "sonner";


const BetCard = ({ bet }) => {
  const navigate = useNavigate();
  

  

  const handleAccept = async (betId) =>{
    // console.log(betId)
    try{
      const data = await apiFetch(`/task/accept/${betId}`)

      if(data.success){

        toast.success(data.message+" Go To Your Profile Page to Check the task")
        await new Promise(resolve => setTimeout(resolve,1000));
         window.location.reload();
      }
      else{
        toast.error(data.message)
        
      }

    }
    catch(error){
      toast.error(error.message)
    }


  }
  return (
    <div
  className="bg-white/80 backdrop-blur-lg rounded-2xl 
             shadow-lg border border-white/30 
             p-6 transition-transform hover:scale-[1.03] 
             duration-300 w-full max-w-md mx-auto 
             h-[500px] sm:h-[480px] md:h-[460px] lg:h-[450px] 
             flex flex-col justify-between
             hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
  onClick={() => navigate(`/bet/${bet._id}`)}
>
  <div>
    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 drop-shadow-sm">
      {bet.title}
    </h2>
    <p className="whitespace-pre-line text-gray-700 mb-4 line-clamp-3">
      {bet.description || "No description provided."}
    </p>

    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2 text-gray-700">
        <FaUser className="text-blue-600" />
        <span className="font-medium">Creator:</span> {bet.creator_id?.username || "Unknown"}
      </div>
      <div className="flex items-center gap-2 text-gray-700">
        <FaUser className="text-green-600" />
        <span className="font-medium">Acceptor:</span> {bet.acceptor_id?.username || "Waiting"}
      </div>
      <div className="flex items-center gap-2 text-gray-700">
        <FaMoneyBillWave className="text-yellow-600" />
        <span className="font-medium">Amount:</span> ₹{bet.amount}
      </div>
      <div className="flex items-center gap-2 text-gray-700">
        <FaClock className="text-red-600" />
        <span className="font-medium">Deadline:</span>{" "}
        {new Date(bet.deadline).toLocaleString()}
      </div>
      <div className="flex items-center gap-2 text-gray-700">
        <FaTrophy className="text-purple-600" />
        <span className="font-medium">Winner:</span>{" "}
        {bet.winner ? bet.winner.username || bet.winner : "TBD"}
      </div>
    </div>
  </div>

  {/* Footer with status and action button */}
  <div className="flex items-center justify-between mt-4">
    <span
      className={`inline-block px-3 py-1 rounded-full text-white font-semibold text-xs shadow-md ${
        bet.status === "pending"
          ? "bg-yellow-500 shadow-yellow-300/60"
          : bet.status === "accepted"
          ? "bg-blue-500 shadow-blue-300/60"
          : bet.status === "completed"
          ? "bg-purple-500 shadow-purple-300/60"
          : bet.status === "success"
          ? "bg-green-600 shadow-green-300/60"
          : bet.status === "failed"
          ? "bg-red-500 shadow-red-300/60"
          : "bg-gray-500"
      }`}
    >
      {bet.status.toUpperCase()}
    </span>

    {bet.status === "pending" && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleAccept(bet._id);
        }}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-full text-xs md:text-sm transition duration-300 shadow-md hover:shadow-[0_4px_20px_rgba(99,102,241,0.7)]"
      >
        Accept Task
      </button>
    )}
  </div>
</div>

  
  );
};

export default BetCard;

