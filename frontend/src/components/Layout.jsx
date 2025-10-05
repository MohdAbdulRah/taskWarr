import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const Layout = () => {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith("/chats");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      {!isChatPage &&  <Footer />}  
      
    </div>
  );
};

export default Layout;
