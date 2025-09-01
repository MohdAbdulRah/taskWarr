import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Toaster, toast } from "sonner";
import { apiFetch } from '../utils/api';
import { BadgeDollarSign } from "lucide-react";
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [bal,setBalance] = useState(0);
  const [user, setUser] = useState(() => localStorage.getItem("user"));
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user); // convert to boolean

    
    const fetchBalance = async () => {
       await apiFetch(`/user/${user}`)
       .then(data => {
        if (data.success) setBalance(data.user.balance)
      });
    }

    fetchBalance();


  }, [bal]);

  const handleLogout = () => {
    try{
      apiFetch('/user/logout')
          .then((data) =>{ 
            toast.success(data.message || "logged Out Successfully")
       })

      localStorage.removeItem("user");
      setIsLoggedIn(false);
      navigate('/signin');
    }
    catch(error){
      toast.error(error.message||"Something went wrong while logging out user")
    }
    
  };

  const navLinkClass = ({ isActive }) =>
    `px-3 py-1 rounded-lg font-medium transition-all duration-300
     ${isActive ? 'bg-white text-blue-600 shadow-md' : 'text-white hover:bg-white hover:text-blue-700'}`;

  return (
    <nav className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-700 shadow-xl sticky top-0 z-50">
      <Toaster position="top-right" richColors/>
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-green-200 via-emerald-300 to-teal-300 bg-clip-text text-transparent tracking-wide">
          Task<span className="text-white">War</span>
        </h1>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-6 text-lg">
          <NavLink to="/" className={navLinkClass}>Home</NavLink>
          {isLoggedIn ? (
            <>
              <NavLink to="/profile" className={navLinkClass}>
  <div className="flex items-center gap-2">
    
    <span>Profile</span>
  </div>
</NavLink>
<NavLink to="/bet/create" className={navLinkClass}>
  <div className="flex items-center gap-2">
    
    <span>Create Task</span>
  </div>
</NavLink>
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded-lg font-medium bg-white text-red-600 shadow-md hover:bg-red-100 transition-all duration-300"
              >
                Logout
              </button>
              <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-sm shadow-md">
      <BadgeDollarSign className="w-4 h-4" />
      ₹{bal}
    </div>
            </>
          ) : (
            <>
              <NavLink to="/signup" className={navLinkClass}>SignUp</NavLink>
              <NavLink to="/signin" className={navLinkClass}>SignIn</NavLink>
            </>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-white">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {isOpen && (
  <div className="md:hidden px-4 pb-4">
    <div className="rounded-2xl bg-white shadow-2xl p-6 space-y-4 transition-all duration-300">
      <NavLink
        to="/"
        onClick={toggleMenu}
        className="flex items-center gap-3 text-blue-600 font-medium hover:text-blue-800"
      >
        🏠 Home
      </NavLink>

      {isLoggedIn ? (
        <>
          <NavLink
            to="/profile"
            onClick={toggleMenu}
            className="flex items-center gap-3 text-blue-600 font-medium hover:text-blue-800"
          >
            👤 Profile
          </NavLink>
          <NavLink
            to="/bet/create"
            onClick={toggleMenu}
            className="flex items-center gap-3 text-blue-600 font-medium hover:text-blue-800"
          >
            📝 Create Task
          </NavLink>
          <button
            onClick={() => {
              handleLogout();
              toggleMenu();
            }}
            className="flex items-center gap-3 text-red-500 font-semibold hover:text-red-700 transition-colors"
          >
            🚪 Logout
          </button>
        </>
      ) : (
        <>
          <NavLink
            to="/signup"
            onClick={toggleMenu}
            className="flex items-center gap-3 text-blue-600 font-medium hover:text-blue-800"
          >
            📝 Sign Up
          </NavLink>
          <NavLink
            to="/signin"
            onClick={toggleMenu}
            className="flex items-center gap-3 text-blue-600 font-medium hover:text-blue-800"
          >
            🔐 Sign In
          </NavLink>
        </>
      )}
    </div>
  </div>
)}

    </nav>
  );
};

export default Navbar;

