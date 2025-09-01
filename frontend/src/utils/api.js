// utils/api.js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiFetch = async (path, options = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include', // if using cookies/sessions
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  // Optionally handle error codes
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Something went wrong');
  }

  return response.json();
};
