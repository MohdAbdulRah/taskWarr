// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem("user");

  if (!user) {
    toast.error("Please Signin to continue")
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default ProtectedRoute;
