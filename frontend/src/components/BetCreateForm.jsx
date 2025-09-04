import React, { useState } from 'react';

const BetCreateForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    amount: '',
    deadline: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title) newErrors.title = 'Title is required';
    if (!form.amount) newErrors.amount = 'Amount is required';
    if (!form.deadline) newErrors.deadline = 'Deadline is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
    } else {
      onSubmit(form);
    }
  };

  return (
    <div className="rounded-2xl shadow-2xl p-8 bg-white/20 backdrop-blur-xl border border-white/30">
      <h2 className="text-center text-4xl font-bold mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 text-transparent bg-clip-text drop-shadow-lg">
        Create a New Bet
      </h2>

      {/* Glowing divider */}
      <div className="h-1 w-32 mx-auto mb-6 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 shadow-[0_0_15px_rgba(236,72,153,0.8)]"></div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-white font-semibold">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="A Task for others"
          />
          {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-white font-semibold">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            placeholder="Explain the task or add context..."
            rows={4}
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-white font-semibold">Amount (₹)</label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="500"
          />
          {errors.amount && <p className="text-red-400 text-sm mt-1">{errors.amount}</p>}
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-white font-semibold">Deadline</label>
          <input
            type="datetime-local"
            name="deadline"
            value={form.deadline}
            onChange={handleChange}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {errors.deadline && <p className="text-red-400 text-sm mt-1">{errors.deadline}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 text-white font-bold rounded-xl shadow-lg hover:scale-105 transform transition"
        >
          🚀 Create Bet
        </button>
      </form>
    </div>
  );
};

export default BetCreateForm;

