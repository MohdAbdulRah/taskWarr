import React, { useEffect, useState } from 'react'
import { apiFetch } from '../utils/api'
import { Bell, PartyPopper, Handshake, AlertTriangle, CoinsIcon, UserIcon, IndianRupeeIcon, DollarSignIcon, GemIcon } from "lucide-react";

const Notifications = () => {
  const [notifications,setNotifications] = useState([])
  useEffect(() => {
      const getData = async () => {
        let data = await apiFetch("/user/notifications")
        console.log(data)
        setNotifications(data.notifications)
        // window.location.reload();

        // ✅ turant parent NavLink wale dot ko update karne ke liye event bhejo
       window.dispatchEvent(new Event("notificationsRead"));
      }

      getData()
  },[])
  const getIcon = (message) => {
    if (!message) return <Bell className="w-5 h-5 sm:w-7 sm:h-7 text-gray-600" />;

    const firstWord = message.split(" ")[0].toLowerCase();

    if (firstWord === "task") return <Bell className="w-5 h-5 sm:w-7 sm:h-7 text-indigo-600" />;
    if (firstWord === "welcome") return <Handshake className="w-5 h-5 sm:w-7 sm:h-7 text-blue-600" />;
    if (firstWord === "hurray") return <PartyPopper className="w-5 h-5 sm:w-7 sm:h-7 text-green-600" />;
    if (firstWord === "bad") return <AlertTriangle className="w-5 h-5 sm:w-7 sm:h-7 text-red-600" />;
    if (firstWord === "your") return <UserIcon className="w-5 h-5 sm:w-7 sm:h-7 text-black-600" />;
    if (firstWord === "amount") return <GemIcon className="w-5 h-5 sm:w-7 sm:h-7 text-purple-600" />;

    return <Bell className="w-5 h-5 sm:w-7 sm:h-7 text-gray-600" />;
  };
  return (
    <div className="min-h-screen bg-cover bg-center relative" style={{ backgroundImage: "url('/images/neon-gaming-wuxz16l1r2afs8af.jpg')" }}>
  <div className="absolute inset-0 bg-black/50"></div> {/* Dark overlay to dim background */}
  <div className="relative p-4 sm:p-6 lg:p-12 max-w-5xl mx-auto">
    {/* Notifications list */}
    <div className="space-y-4">
      {notifications.map((not, idx) => (
        <div key={idx} className="backdrop-blur-md bg-white/40 rounded-2xl p-4 flex items-start space-x-4 shadow-lg transition transform hover:scale-105">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center">
            {getIcon(not.message)}
          </div>
          <div>
            <p className="text-sm sm:text-base lg:text-lg font-medium text-gray-900">{not.message}</p>
            <p className="text-xs sm:text-sm text-gray-700 mt-1">{new Date(not.gettime).toLocaleString()}</p>
          </div>
        </div>
      ))}
      {!notifications.length && <p className="text-gray-200 text-center">No Notifications</p>}
    </div>
  </div>
</div>

  )
}

export default Notifications
