import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import Layout from './components/Layout';
import SignIn from './pages/SignIn';
import Notifications from './pages/Notifications';
import Profile from "./pages/Profile"
import ProtectedRoute from './components/ProtectedRoute';
import BetDetailsPage from './pages/BetDetailsPage';
import BetCreate from './pages/BetCreate';
import NotFound from './components/NotFound';
import BetDoneForm from './pages/BetDoneForm';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="signin" element={<SignIn/>} />
          <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="notifications"
          element = {
            <ProtectedRoute>
              <Notifications/>
            </ProtectedRoute>
          }
        />
          <Route
          path="bet/create"
          element={
            <ProtectedRoute>
              <BetCreate />
            </ProtectedRoute>
          }
        />
          <Route path="/bet/:id" element={
            <ProtectedRoute>
              <BetDetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/bet/done/:id" element={
            <ProtectedRoute>
              <BetDoneForm />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;

