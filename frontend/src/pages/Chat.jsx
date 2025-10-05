import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { apiFetch } from "../utils/api";
import { Send } from "lucide-react";

const socket = io("http://localhost:3000", { withCredentials: true });

export default function Chat({ loggedInUser, preselectedReceiver }) {
  const [selectedUser, setSelectedUser] = useState(preselectedReceiver || "");
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const messagesEndRef = useRef(null);

  const roomId = [loggedInUser?._id, selectedUser].filter(Boolean).sort().join("_");

  // Fetch users
  useEffect(() => {
    apiFetch("/all-users")
      .then(res => res.success && setUsers(res.users))
      .catch(err => console.error(err));
  }, []);

  // Update selected user if prop changes
  useEffect(() => {
    if (preselectedReceiver) setSelectedUser(preselectedReceiver);
  }, [preselectedReceiver]);

  // Join room & fetch messages
  useEffect(() => {
    if (!roomId) return;

    socket.emit("join_room", roomId);

    const fetchMessages = async () => {
      try {
        const [user1, user2] = roomId.split("_");
        const res = await apiFetch(`/messages/${user1}/${user2}`);
        setMessages(res || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();

    const handleReceiveMessage = (data) => {
      if (data.roomId === roomId) setMessages(prev => [...prev, data]);
    };
    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [roomId]);

  // auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const sendMessage = async () => {
    if (!message || !selectedUser) return;

    const data = {
      sender: loggedInUser._id,
      receiver: selectedUser,
      content: message,
      roomId
    };

    socket.emit("send_message", data);
    setMessage("");

    try {
      await apiFetch("/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (!loggedInUser) return <p className="p-4">Loading user...</p>;

  const selectedUserData = users.find(u => u._id === selectedUser);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header - 20vh */}
      <div
  className="px-6 py-4 bg-white border-b border-gray-200 shadow-sm flex-shrink-0"
  style={{ height: "10vh" }}
>
  <div className="flex items-center h-full gap-4">
    {/* Avatar */}
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md text-lg">
      {selectedUserData?.username?.charAt(0).toUpperCase() || "C"}
    </div>

    {/* Username + status */}
    <div className="flex flex-col">
      <h2 className="text-lg font-semibold text-gray-900">
        {selectedUserData?.username || "Chat"}
      </h2>
      <p className="text-xs text-green-500">Online</p>
    </div>
  </div>
</div>


      {/* Messages - 60vh */}
      <div
        className="px-6 py-4 overflow-y-auto space-y-4"
        style={{ height: "65vh" }}
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400 text-center">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.sender === loggedInUser._id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                  msg.sender === loggedInUser._id
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm"
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
                }`}
              >
                <p className="text-sm leading-relaxed break-words">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - 20vh */}
      <div className="p-4 bg-white border-t border-gray-200 shadow-lg flex-shrink-0" style={{ height: "15vh" }}>
        <div className="flex gap-3 items-center max-w-4xl mx-auto h-full">
          <input
            className="flex-1 border border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Type a message..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
          />
          <button
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={sendMessage}
            disabled={!message.trim()}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
