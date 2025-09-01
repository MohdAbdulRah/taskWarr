import React, { useState } from "react";
import { Toaster, toast } from "sonner";
import { apiFetch } from "../utils/api";

const SignInForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Please fill all fields");
      return;
    }

    // Proceed with form submission (e.g., API call)
    // toast.success("All fields are filled. Submitting...");
    try {
      setLoading(true); // Start loading
      const data = await apiFetch('/user/login', {
        method: 'POST',
        body: JSON.stringify({
          username,
          password,
        }),
      });
  
      localStorage.setItem("user",username);
      toast.success('Signup successful!');
      window.location.href ="/profile"
      console.log(data);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    } finally {
      setLoading(false); // Stop loading regardless of success/failure
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-gradient-to-r from-blue-50 to-purple-100 px-4 py-8">
      <Toaster position="top-right" richColors/>

      {/* Left - Signup Form */}
      <div className="w-full max-w-md lg:max-w-lg bg-white shadow-2xl rounded-3xl p-8 md:p-12">
        <h2 className="text-4xl font-bold text-center text-indigo-600 mb-6 font-serif">
          LogIn 
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Username</label>
            <input
              type="text"
              placeholder="john_doe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
            />
          </div>

          

          <div>
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
            />
          </div>

          <button
  type="submit"
  disabled={loading}
  className={`w-full flex items-center justify-center gap-2 
    ${loading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} 
    text-white font-semibold py-3 rounded-xl shadow-md transition duration-300`}
>
  {loading ? (
    <>
      <svg
        className="animate-spin h-5 w-5 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8z"
        ></path>
      </svg>
      Verifying...
    </>
  ) : (
    "Sign In"
  )}
</button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't Have an account?{" "}
          <a href="/signup" className="text-indigo-600 font-semibold hover:underline">
            Sign up
          </a>
        </p>
      </div>

      {/* Right - Matching Image */}
      <div className="hidden lg:block lg:w-[40%] w-full max-w-md lg:max-w-lg mt-10 lg:mt-0 lg:ml-10">
        <div className="bg-white shadow-2xl rounded-3xl h-full p-8 flex items-center justify-center">
          <img
            src="/images/loginImage.png"
            alt="Task Management"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
