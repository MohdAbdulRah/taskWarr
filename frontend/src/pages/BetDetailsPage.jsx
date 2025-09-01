import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../utils/api";
import React from "react";
import { toast,Toaster } from "sonner";

const BetDetailsPage = () => {
  const { id } = useParams();
  const [bet, setBet] = useState(null);
  const [isLoggedIn,setIsLoggedIn] = useState(false)
  const [user,setUser] = useState(null)
  const navigate = useNavigate()
  const [showModalForm, setShowModalForm] = useState(false);
  const [proofInputs, setProofInputs] = useState([""]);
  const [proofSubmit, setProofSubmit] = useState(false);

  useEffect(() => {
    apiFetch(`/task/${id}`)
      .then(data => {
        if (data.success) setBet(data.task);
      });
    
      const username = localStorage.getItem("user");
      const fetchUser = async () => {
           try{
             if(username){
              const data = await apiFetch(`/user/${username}`)
              if(data.success){
                setUser(data.user)
                setIsLoggedIn(true)
              }
              else{
                setIsLoggedIn(false)
                toast.error(data.message || "Failed to fetch user data")
              }

              
             }
            //  console.log(user)
             
           }
           catch(error){
               toast.error(error.message || "Failed to fetch user data")
           }
      }

      fetchUser()
  }, [id]);



const handleProofChange = (index, value) => {
  const newInputs = [...proofInputs];
  newInputs[index] = value;
  setProofInputs(newInputs);
};

const addMoreProofInput = () => {
  setProofInputs([...proofInputs, ""]);
};

const handleProofSubmit = async (e) => {
  e.preventDefault();
  setProofSubmit(true);
    try {
      console.log(`Submitted Urls : ${proofInputs}`)
      const res = await apiFetch(`/task/done/${id}`, {
        method: "POST",
        body: JSON.stringify({ proof: proofInputs }),
      });
  
      if (res.success) {
        toast.success(`Proof submitted! ${res.task.amount} is funded to your account and the rest half amount will funded once the creator verifies your work`);
        const refreshed = await apiFetch(`/task/${id}`);
        setShowModalForm(false);
        setProofInputs([""]);
        if (refreshed.success) {
          setBet(refreshed.task);
        }
        await new Promise(resolve => setTimeout(resolve,1000));
         window.location.reload();
      } else {
        toast.error(res.message || "Failed to submit");
      }
    } catch (err) {
      toast.error(err.message || "Error occurred");
    } finally {
      setProofSubmit(false);
    }
};
  
  
  const handleRight = async () => {
    if (!bet) return toast.error("Bet not found");

    try {
      const res = await apiFetch(`/task/verify/${id}`);

      if (res.success) {
        toast.success("Task marked as right! Task amount is funded to winner account");
        const refreshed = await apiFetch(`/task/${id}`);
        if (refreshed.success) {
          setBet(refreshed.task);
        }
        await new Promise(resolve => setTimeout(resolve,1000));
         window.location.reload();
      } else {
        toast.error(res.message || "Failed to mark right");
      }
    } catch (err) {
      toast.error(err.message || "Error occurred");
    }
  }

  const handleWrong = async () => {
    if (!bet) return toast.error("Bet not found");

    try {
      const res = await apiFetch(`/task/unverify/${id}`);

      if (res.success) {
        toast.success("Task marked as wrong! Task amount is refunded to creator account");
        const refreshed = await apiFetch(`/task/${id}`);
        if (refreshed.success) {
          setBet(refreshed.task);
        }
        await new Promise(resolve => setTimeout(resolve,1000));
         window.location.reload();
      } else {
        toast.error(res.message || "Failed to mark wrong");
      }
    } catch (err) {
      toast.error(err.message || "Error occurred");
    }
  }
  const refundMoney = async () => {

    try{
      const data = await apiFetch(`/task/refund/${id}`)
      toast.success(data.message)
      await new Promise(resolve => setTimeout(resolve,1000));
      window.location.reload();
    }
    catch(error){
      toast.error(error.message)
    }
  }
  if (!bet)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        Loading Bet Details...
      </div>
    );

    const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleString() : "—";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-6">
      <Toaster position="top-right" richColors />
      <div className="max-w-4xl w-full bg-white/30 backdrop-blur-md text-white shadow-2xl rounded-3xl p-10 ring-2 ring-white/20 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 w-full">
  {/* Title */}
  <h1 className="text-4xl font-bold text-white drop-shadow">
    🎯 {bet.title}
  </h1>

  {/* Buttons Section */}
  <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto justify-end">
    {/* Submit Proof button */}
    {user && user.username === bet.acceptor_id?.username && bet.status === "accepted" && (
      <button
        onClick={() => setShowModalForm(true)}
        className="w-full md:w-auto px-5 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full shadow-md transition duration-200"
      >
        ✅ Submit Proof
      </button>
    )}

    {/* Refund button */}
    {user && user.username === bet.creator_id?.username && bet.status === "failed" && (
      <button
        onClick={refundMoney}
        className="w-full md:w-auto px-5 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full shadow-md transition duration-200"
      >
        Refund
      </button>
    )}

    {/* Right / Wrong buttons for creator */}
    {user && user.username === bet.creator_id?.username && bet.status === "completed" && (
      <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
        <button
          onClick={handleRight}
          className="flex items-center justify-center gap-2 
                     w-full sm:w-full md:w-12 h-12 
                     bg-green-500 hover:bg-green-600 
                     text-white text-base font-semibold 
                     rounded-lg md:rounded-full 
                     shadow-md transition duration-200"
        >
          ✅ <span className="block md:hidden">Right</span>
        </button>

        <button
          onClick={handleWrong}
          className="flex items-center justify-center gap-2 
                     w-full sm:w-full md:w-12 h-12 
                     bg-red-500 hover:bg-red-600 
                     text-white text-base font-semibold 
                     rounded-lg md:rounded-full 
                     shadow-md transition duration-200"
        >
          ❌ <span className="block md:hidden">Wrong</span>
        </button>
      </div>
    )}
  </div>
</div>



        <p className=" whitespace-pre-line text-lg text-white/90 mb-8">{bet.description || "No description provided"}</p>

        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <Detail label="💲 Amount" value={bet.original_amount && `₹${bet.original_amount}`} />
          <Detail label="💰 Current Amount with Bet" value={`₹${bet.amount}`} />
          <Detail label="📌 Status" value={capitalize(bet.status)} />
          <Detail label="🕒 Created At" value={formatDate(bet.createdAt)} />
          <Detail label="⏳ Deadline" value={formatDate(bet.deadline)} />
          <Detail label="✅ Resolved At" value={formatDate(bet.resolved_at)} />
          <Detail label="🧑 Creator" value={bet.creator_id?.username || "—"} />
          <Detail label="👤 Acceptor" value={bet.acceptor_id?.username || "Not Accepted"} />
          <Detail label="🏆 Winner" value={bet.winner?.username || "Not Decided"} />
          <Detail
  label="🧾 Proof"
  value={
    Array.isArray(bet.proof) && bet.proof.length > 0 ? (
      <div className="space-y-1">
        {bet.proof.map((url, index) => (
          <div key={index}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-100 underline hover:text-white transition"
            >
              View Proof {bet.proof.length > 1 ? `#${index + 1}` : ""}
            </a>
          </div>
        ))}
      </div>
    ) : (
      "Not Provided"
    )
  }
/>

         
          
        </div>
      </div>
      {showModalForm && (
  <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md text-black relative">
      <button
        className="absolute top-2 right-3 text-gray-700 hover:text-red-500 text-xl font-bold"
        onClick={() => setShowModalForm(false)}
      >
        ×
      </button>
      <h2 className="text-2xl font-semibold mb-4 text-center">Submit Proof</h2>
      <form onSubmit={handleProofSubmit} className="space-y-4">
        {proofInputs.map((input, index) => (
          <input
            key={index}
            type="url"
            placeholder={`Proof URL ${index + 1}`}
            value={input}
            onChange={(e) => handleProofChange(index, e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        ))}
        
        <button
          type="button"
          onClick={addMoreProofInput}
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          + Add another link
        </button>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium"
        >
          {proofSubmit ? (
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
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </button>
      </form>
    </div>
  </div>
)}

    </div>
  );
};

const Detail = ({ label, value }) => (
  <div className="bg-white/20 p-4 rounded-xl hover:ring-2 hover:ring-white/30 transition-all backdrop-blur-sm shadow-md">
    <p className="text-sm text-white/70">{label}</p>
    {typeof value === "string" || typeof value === "number" ? (
      <p className="font-semibold text-white text-base">{value}</p>
    ) : (
      <div className="font-semibold text-white text-base">{value}</div>
    )}
  </div>
);


const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);


export default BetDetailsPage;
