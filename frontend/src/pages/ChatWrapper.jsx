import React, { useEffect, useState } from "react";
import Chat from "./Chat";
import { apiFetch } from "../utils/api";
import { useParams } from "react-router-dom";

export default function ChatWrapper() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const { creatorId } = useParams();

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
  
  return <Chat loggedInUser={loggedInUser} preselectedReceiver={creatorId} />;
}