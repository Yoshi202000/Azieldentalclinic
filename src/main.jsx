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
import FeedBack from './component/FeedBack.jsx';
import MessagePage from './component/Message.jsx';
import HealthRecord from './pages/HealthRecord/HealthRecord.jsx';

// import pages not yet done section
// Test components (for testing purposes)
import Chat from './component/chat.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>

        {/* test component */}
        {/* scroll function is not yet done */}
        <Route path="/chat" element={<Chat />} />

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
        <Route 
          path="/healthRecord" 
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <HealthRecord />
            </ProtectedRoute>
          } 
        />


        {/* Protected Routes for Patients and Admins */}

        {/* scroll function is not yet done */}
        <Route 
        path="/message" 
        element={
          <ProtectedRoute allowedRoles={["patient", "admin"]}>
        <MessagePage />
        </ProtectedRoute>
        } />

        {/* appointmentStepThree design */}
        <Route 
          path="/appointment" 
          element={
            <ProtectedRoute allowedRoles={["patient", "admin"]}>
              <Appointment />
            </ProtectedRoute>
          } 
        />
        {/* remove the admin route once done */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <Profile />
            </ProtectedRoute>
          } 
        />

        {/* Protected Routes for Admins Only */}

        {/* show the profile information */}
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
