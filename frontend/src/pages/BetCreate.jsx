import React from 'react';
import BetCreateForm from '../components/BetCreateForm';
import { apiFetch } from '../utils/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const BetCreate = () => {
  const navigate = useNavigate()
  const handleCreateBet = async (data) => {
    try {
        const result = await apiFetch('/task/bet', {
            method: 'POST',
            body: JSON.stringify(data),
          });
      if (result.success) {
        toast.success('Bet created successfully!');
        navigate("/profile") 
      } else {
        toast.error(result.message || "Failed to create bet");
      }
    } catch (error) {
      toast.error(error.message || "Server error");
      console.log(error.message)
    }
  };

  return <BetCreateForm onSubmit={handleCreateBet} />;
};

export default BetCreate;

