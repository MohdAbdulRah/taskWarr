import React, { useState, useEffect } from 'react'
import { apiFetch } from '../utils/api'
import BetCard from '../components/BetCard'
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'

export default function Home() {
  const [tasks, setTasks] = useState([])
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [topusers,setTopUsers] = useState([]);

  useEffect(() => {
    apiFetch('/task/all')
      .then((data) => {
        setTasks(data.tasks)
      })
      .catch(err => console.error('Error:', err.message))

     apiFetch('/top-winners')
     .then((data) => {
      setTopUsers(data.users)
     })
     .catch(err =>  console.error('Error:', err.message))
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm scale-105"
        style={{ backgroundImage: "url('/images/option1.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/60" />

      {/* Main content */}
      <div className="relative z-10 p-4 max-w-6xl mx-auto">
        <h1 className="text-white text-center text-4xl sm:text-6xl font-bold mb-2 drop-shadow-lg">
          Current Bets
        </h1>

        <div className="h-1 w-32 mx-auto mb-4 rounded-full 
                        bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 
                        shadow-[0_0_15px_rgba(236,72,153,0.8)]"></div>

        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 pb-14">
          {tasks.map((task, index) => (
            <BetCard key={index} bet={task} />
          ))}
        </div>
      </div>

      {/* Toggle Button - Desktop & Tablet (Right side) */}
      <button
  onClick={() => setShowLeaderboard(!showLeaderboard)}
  className={`hidden md:flex fixed top-1/2 transform -translate-y-1/2 
              bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-l-full shadow-lg z-40
              transition-all duration-500
              ${showLeaderboard ? "right-80" : "right-0"}`}
>
  {showLeaderboard ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
</button>

      {/* Toggle Button - Mobile (Below Navbar) */}
      <button
        onClick={() => setShowLeaderboard(!showLeaderboard)}
        className="md:hidden absolute top-16 right-4 
                   bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-lg z-20"
      >
        {showLeaderboard ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </button>

      {/* Leaderboard - Desktop & Tablet (Right Sidebar) */}
      <div
        className={`hidden md:block fixed top-16 right-0 h-[calc(100%-64px)] w-80 
                    bg-white/30 backdrop-blur-xl shadow-2xl border-l border-white/30 
                    transform transition-transform duration-500 z-30
                    ${showLeaderboard ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-6 text-white relative h-full">
          <button
            onClick={() => setShowLeaderboard(false)}
            className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow"
          >
            ✖
          </button>
          <h2 className="text-2xl font-bold mb-6">🏆 Leaderboard</h2>
          <ol className="space-y-3 list-decimal list-inside" >
            {topusers.map((user,index)=>{
                 return <li className="flex justify-between text-black" key={index}><span>{index+1}. {user.username}</span> <span>{user.totalWinAmount}</span></li>
            })}
          
          </ol>
        </div>
      </div>

      {/* Leaderboard - Mobile (Top Dropdown) */}
      <div
        className={`md:hidden fixed top-16 left-0 w-full h-[calc(100%-64px)] 
                    bg-white/20 backdrop-blur-xl shadow-2xl border-t border-white/30 
                    transform transition-transform duration-500 z-30
                    ${showLeaderboard ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="p-6 text-white relative h-full">
          <button
            onClick={() => setShowLeaderboard(false)}
            className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow"
          >
            ✖
          </button>
          <h2 className="text-2xl font-bold mb-6">🏆 Leaderboard</h2>
          <ol className="space-y-3 list-decimal list-inside" >
            {topusers.map((user,index)=>{
                 return <li className="flex justify-between text-black" key={index}><span>{index+1}. {user.username}</span> <span>{user.totalWinAmount}</span></li>
            })}
          
          </ol>
        </div>
      </div>
    </div>
  )
}
