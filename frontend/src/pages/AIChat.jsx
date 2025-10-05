import React, { useState, useRef, useEffect } from "react";
import { apiFetch } from "../utils/api";
import { formatMessage } from "../utils/formatMessage";

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleSend = async (text, retries = 2) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const data = await apiFetch("/ask", {
        method: "POST",
        body: JSON.stringify({ prompt: text, history: messages }),
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ **The AI is busy right now.**\nPlease try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-700 via-pink-600 to-red-500">
      {/* Navbar */}
      <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-md px-6 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-purple-700">⚡ TaskWar AI</h1>
        <span className="text-sm text-gray-600">Your Smart Assistant</span>
      </nav>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl max-w-xl break-words prose ${
              msg.role === "user"
                ? "ml-auto bg-purple-600 text-white"
                : "mr-auto bg-white text-gray-800 shadow"
            }`}
            dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
          />
        ))}

        {loading && (
          <div className="mr-auto bg-white text-gray-600 p-3 rounded-xl shadow max-w-xs italic">
            Typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 w-full bg-white p-4 shadow-md flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
        />
        <button
          onClick={() => handleSend(input)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AIChat;


