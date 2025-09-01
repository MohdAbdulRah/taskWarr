import React, { useState } from 'react'
import { useEffect } from 'react';
import { apiFetch } from '../utils/api';
import BetCard from '../components/BetCard';

export default function Home() {
    const [tasks,setTasks] = useState([]);
    
    useEffect(() => {
        apiFetch('/task/all')
          .then((data) =>{ 
            setTasks(data.tasks)
            // console.log('Response:', data)
          })
          .catch(err => console.error('Error:', err.message));
      }, [tasks]);
    return (
      <div className="relative min-h-screen overflow-hidden">
      {/* 🔹 Background Image with Blur */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-sm scale-105"
        style={{ backgroundImage: "url('/images/background9.jpg')" }}
      />
    
      {/* 🔸 Optional Gradient Overlay (for contrast) */}
      <div className="absolute inset-0 bg-black/30" />
    
      {/* 🔸 Foreground Content */}
      <div className="relative z-10">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white text-center my-6 font-bold"
          style={{ fontFamily: "'Great Vibes', cursive" }}
        >
          Current Bets
        </h1>
    
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 pb-10">
          {tasks.map((task, index) => (
            <BetCard key={index} bet={task} />
          ))}
        </div>
      </div>
    </div>
    
    )
}
