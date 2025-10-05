import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../utils/api";
import React from "react";
import { toast, Toaster } from "sonner";
import ProofSubmissionModal from "../components/ProofSubmissionModal";

const BetDetailsPage = () => {
  const { id } = useParams();
  const [bet, setBet] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [showModalForm, setShowModalForm] = useState(false);
  const [proofSubmit, setProofSubmit] = useState(false);

  useEffect(() => {
    apiFetch(`/task/${id}`)
      .then(data => {
        if (data.success) setBet(data.task);
      });
    
    const username = localStorage.getItem("user");
    const fetchUser = async () => {
      try {
        if (username) {
          const data = await apiFetch(`/user/${username}`);
          if (data.success) {
            setUser(data.user);
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
            toast.error(data.message || "Failed to fetch user data");
          }
        }
      } catch (error) {
        toast.error(error.message || "Failed to fetch user data");
      }
    };

    fetchUser();
  }, [id]);

  // Updated handleProofSubmit to work with the new modal
  const handleProofSubmit = async (proofData) => {
    setProofSubmit(true);
    try {
      console.log(`Submitted Proof Data:`, proofData);
      const res = await apiFetch(`/task/done/${id}`, {
        method: "POST",
        body: JSON.stringify({ proof: proofData }),
      });

      if (res.success) {
        toast.success(`Proof submitted! ${res.task.amount} is funded to your account and the rest half amount will funded once the creator verifies your work`);
        const refreshed = await apiFetch(`/task/${id}`);
        setShowModalForm(false);
        if (refreshed.success) {
          setBet(refreshed.task);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
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
        await new Promise(resolve => setTimeout(resolve, 1000));
        window.location.reload();
      } else {
        toast.error(res.message || "Failed to mark right");
      }
    } catch (err) {
      toast.error(err.message || "Error occurred");
    }
  };

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
        await new Promise(resolve => setTimeout(resolve, 1000));
        window.location.reload();
      } else {
        toast.error(res.message || "Failed to mark wrong");
      }
    } catch (err) {
      toast.error(err.message || "Error occurred");
    }
  };

  const refundMoney = async () => {
    try {
      const data = await apiFetch(`/task/refund/${id}`);
      toast.success(data.message);
      await new Promise(resolve => setTimeout(resolve, 1000));
      window.location.reload();
    } catch (error) {
      toast.error(error.message);
    }
  };

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
  {bet.proof.map((url, index) => {
    // Use the secure URL directly for raw files, otherwise add fl_attachment for images
    const proofUrl = url.includes('/raw/')
      ? url
      : url.replace('/upload/', '/upload/fl_attachment/');
    return (
      <div key={index}>
        <a
          href={proofUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-100 underline hover:text-white transition"
        >
          View Proof {bet.proof.length > 1 ? `#${index + 1}` : ''}
        </a>
      </div>
    );
  })}
</div>
              ) : (
                "Not Provided"
              )
            }
          />
        {user && user.username !== bet.creator_id?.username && (
          <Detail label="💬 Chat with Creator" value={
  <button
    onClick={() => navigate(`/chats/${bet.creator_id._id}`)}
    className="w-full md:w-auto px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full shadow-md transition duration-200"
  >
    Chat
  </button>
          }/>
     )}
        
        </div>
      </div>

      {/* Use the new ProofSubmissionModal component */}
      <ProofSubmissionModal
        isOpen={showModalForm}
        onClose={() => setShowModalForm(false)}
        onSubmit={handleProofSubmit}
        isSubmitting={proofSubmit}
      />
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
