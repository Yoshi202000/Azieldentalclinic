import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from "./component/protectedRoute";

// Import global styles
import './index.css';

// Import page components done section
import App from './pages/App/App.jsx';
import Login from './pages/login/login.jsx';
import Signup from './pages/Signup/Signup.jsx';
import Appointment from './pages/Appointment/Appointment.jsx';
import Profile from './pages/Profile/Profile.jsx';
import Forgot from './pages/ForgotPass/ForgotPass.jsx';
import Dashboard from './admin/dashboard/Dashboard.jsx';
import Services from './pages/Services/services.jsx';

// import pages not yet done section
import FeedBack from './component/FeedBack.jsx';

// Test components (for testing purposes)
import MessagePage from './component/Message.jsx';
import Chat from './component/chat.jsx'
import ApproveToAdmin from './component/admin/ApproveToAdmin.jsx';
  
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>

        {/* test component */}
        <Route path="/message" element={<MessagePage />} />
        <Route path="/chat" element={<Chat />} />
        <Route path='toadmin' element={<ApproveToAdmin/>}/>
        {/* Public Routes */}
        <Route path="/" element={<App />} />
        <Route path="/home" element={<App />} />
        <Route path="/services" element={<Services />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot" element={<Forgot />} />
        


        {/* Protected Routes for Patients onlys */}
        {/* not yet done for design*/}
        <Route 
          path="/feedBack" 
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <FeedBack />
            </ProtectedRoute>
          } 
        />


        {/* Protected Routes for Patients and Admins */}
        <Route 
          path="/appointment" 
          element={
            <ProtectedRoute allowedRoles={["patient", "admin"]}>
              <Appointment />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute allowedRoles={["patient", "admin"]}>
              <Profile />
            </ProtectedRoute>
          } 
        />

        {/* Protected Routes for Admins Only */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all route - Redirect to home for any undefined routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
