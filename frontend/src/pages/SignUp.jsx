import React, { useState } from "react";
import { Toaster, toast } from "sonner";
import { apiFetch } from "../utils/api";

const SignupForm = () => {
  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [otp,setOtp] = useState("");
  const [otpshow,setOtpShow] = useState(false)
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!username || !mobile || !password) {
      toast.error("Please fill all fields");
      return;
    }
    if(mobile.length != 10){
       toast.error("Phone Number should be 10 digit number");
       return;
    }
  
    setLoading(true); // Start loading
  
    try {
      const data = await apiFetch("/user/signup", {
        method: "POST",
        body: JSON.stringify({
          username,
          mobile,
          otp,
          password,
        }),
      });
      toast.success("Signup successful! Rs.100 Added to your Account Enjoy Tasks . Make a note of username to further login");
      await new Promise(resolve => setTimeout(resolve,1000));
      
      localStorage.setItem("user", username);
      window.location.href = "/profile";
      
      console.log(data);
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    } finally {
      setLoading(false); // Stop loading regardless of success/failure
      setOtpShow(false);
    }
  };

  const handleOtp = async() => {
    console.log("Send otp Was activated");
    if(mobile == "" || mobile.length != 10){
      toast.error("Please fill correct Mobile Number");
      return;
    }
    setOtpShow(true);

    try{
      const data = await apiFetch("/auth/send-otp",{
        method : "POST",
        body: JSON.stringify({
           mobile
         
        }),
      })

      if(data.success){
        toast.success(data.message);
      }
      
    }
    catch(err){
      toast.error(err.message);
      console.error(err);
    }
    
  }
  

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-gradient-to-r from-blue-50 to-purple-100 px-4 py-8">
      <Toaster position="top-right" richColors />

      {/* Left - Signup Form */}
      <div className="w-full max-w-md lg:max-w-lg bg-white shadow-2xl rounded-3xl p-8 md:p-12">
        <h2 className="text-4xl font-bold text-center text-indigo-600 mb-6 font-serif">
          Create Account
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

          {/* Mobile Field */}
<div className="mb-3">
  <label className="block text-gray-700 font-medium mb-1">Mobile</label>
  <input
    type="text"
    placeholder="78XXXXXX98"
    value={mobile}
    onChange={(e) => setMobile(e.target.value)}
    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
  />
</div>

{/* Send OTP Button */}
<div className="mb-3">
  <button
    type="button"
    onClick={handleOtp}
    disabled={loading}
    className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-white transition duration-300 
      ${loading ? "bg-green-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}
    `}
  >
    {loading ? (
      <svg
        className="animate-spin h-5 w-5 mx-auto text-white"
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
    ) : (
      "Send OTP"
    )}
  </button>
</div>

{/* OTP Input - Only show after clicking Send OTP */}
{otpshow && (
  <div className="mb-3">
    <label className="block text-gray-700 font-medium mb-1">OTP</label>
    <input
      type="text"
      placeholder="123456"
      value={otp}
      onChange={(e) => setOtp(e.target.value)}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
    />
  </div>
)}


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
      Signing up...
    </>
  ) : (
    "Sign Up"
  )}
</button>

        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a href="/signin" className="text-indigo-600 font-semibold hover:underline">
            Sign In
          </a>
        </p>
      </div>

      {/* Right - Matching Image */}
      <div className="hidden lg:block lg:w-[40%] w-full max-w-md lg:max-w-lg mt-10 lg:mt-0 lg:ml-10">
        <div className="bg-white shadow-2xl rounded-3xl h-full p-8 flex items-center justify-center">
          <img
            src="/images/Gemini_Generated_Image_bfek4ibfek4ibfek.png"
            alt="Task Management"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default SignupForm;


