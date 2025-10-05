import React from 'react';
import BetCreateForm from '../components/BetCreateForm';
import { apiFetch } from '../utils/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const BetCreate = () => {
  const navigate = useNavigate();

  const handleCreateBet = async (data) => {
    try {
      const result = await apiFetch('/task/bet', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (result.success) {
        toast.success('Bet created successfully!');
        // navigate("/profile");
        window.location.href = "/profile"
      } else {
        toast.error(result.message || "Failed to create bet");
      }
    } catch (error) {
      toast.error(error.message || "Server error");
      console.log(error.message);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4">
  {/* Background */}
  <div
    className="absolute inset-0 bg-cover bg-center filter blur-[2px] scale-105"
    style={{
      backgroundImage: "url('/images/sneon.png')",
    }}
  />
  <div className="absolute inset-0 bg-black/60" />

  {/* Form */}
  <div className="relative z-10 w-full max-w-3xl">
    <BetCreateForm onSubmit={handleCreateBet} />
  </div>
</div>

  );
};

export default BetCreate;



