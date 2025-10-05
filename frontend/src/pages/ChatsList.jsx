import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../utils/api";
import { MessageCircle } from "lucide-react";

export default function ChatsList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    apiFetch("/chat-list")
      .then(res => {
        if (res.success) setUsers(res.users);
      })
      .catch(err => console.error("Chat list fetch error:", err));
  }, []);

  if (!users.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-white">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <MessageCircle size={32} className="text-gray-400" />
        </div>
        <p className="text-gray-500 text-center">
          No chats yet. Start messaging!
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 bg-white">
        <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
        <p className="text-sm text-gray-500 mt-1">{users.length} conversations</p>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        <ul className="divide-y divide-gray-100">
          {users.map(user => (
            <li key={user._id}>
              <Link
                to={`/chats/${user._id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors duration-150 active:bg-gray-100"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  {/* <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div> */}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {user.username}
                    </h3>
                    {/* <span className="text-xs text-gray-500">2m ago</span> */}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    Tap to start chatting
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}