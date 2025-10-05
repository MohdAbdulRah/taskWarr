import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ChatsList from "./ChatsList";
import Chat from "./Chat";
import { apiFetch } from "../utils/api";

export default function ChatLayout() {
  const { creatorId } = useParams();
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    apiFetch("/user/me")
      .then(res => res.success && setLoggedInUser(res.user))
      .catch(err => console.error(err));
  }, []);

  if (!loggedInUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent mb-4"></div>
          <p className="text-gray-600">Loading user...</p>
        </div>
      </div>
    );
  }

  return (
    // Make whole layout full-screen height and use flex columns so children can take full height correctly
    <div className="h-screen flex bg-gray-100">
      {/* Left panel */}
      <div
        className={` ${creatorId ? "hidden sm:block" : "block"} w-full sm:w-96 bg-white border-r border-gray-200 shadow-sm`}
      >
        <ChatsList />
      </div>

      
{/* Right panel */}
{creatorId || window.innerWidth >= 640 ? ( // mobile pe only show if creatorId exists
  <div className="flex flex-col flex-1 h-screen">
    {creatorId ? (
      <Chat loggedInUser={loggedInUser} preselectedReceiver={creatorId} />
    ) : (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Welcome to Messages
          </h3>
          <p className="text-gray-500">
            Select a chat from the sidebar to start messaging
          </p>
        </div>
      </div>
    )}
  </div>
) : null}

    </div>
  );
}
