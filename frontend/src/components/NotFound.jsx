// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';


const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <img
        src="/images/notfound.jpg"
        alt="404 Illustration"
        className="w-full max-w-md mb-8"
      />
      <h1 className="text-5xl font-bold text-gray-800 mb-4">Oops! Page not found</h1>
      <p className="text-lg text-gray-600 mb-6 text-center">
        The page you are looking for doesn’t exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-indigo-700 transition"
      >
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotFound;

