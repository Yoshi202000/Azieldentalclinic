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
import SuccessVerify from './pages/SuccessVerify/SuccessVerify.jsx';

// import pages not yet done section
// Test components (for testing purposes)
import Chat from './component/chat.jsx'
import EditContent from './component/admin/EditContent.jsx';
import TestPreview from './test/TestPreview.jsx';
import DoctorSignup from './component/admin/AddUser.jsx';
import ManageSchedule from './component/profile/manageSchedule.jsx'
import FirstImage from './component/FirstImage.jsx';
import TestSchedule from './test/TestSchedule.jsx';
import TeststepTwo from './test/TestStepTwo.jsx'
import UpdateFee from './test/UpdateFee.jsx';
import DoctorDashboard from './doctor/DoctorDashboard/DoctorDashboard.jsx';
import DentalChartForm from './component/DentalChart.jsx';
import ViewDentalChart from './component/ViewDentalChart.jsx';



const ProtectedVerificationRoute = ({ children }) => {
  const location = useLocation(); // Use useLocation to get the current URL
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token'); // Get token from the URL
  if (token) {
    return children; // Allow access if token is present
  } else {
    // Redirect to login if token is not valid
    return <Navigate to="/login" replace />;
  }
};



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>

        {/* test component */}
        {/* scroll function is not yet done */}
        <Route path="/chat" element={<Chat />} />
        <Route path='/addUser' element={<DoctorSignup/>} />
        <Route path='/image' element={<FirstImage/>} />
        <Route path='/schedule' element={<ManageSchedule/>}/>
        <Route path='/testSched' element={<TestSchedule/>}/>
        <Route path='/steptwo' element={<TeststepTwo/>}/>
        <Route path='/fee' element={<UpdateFee/>}/>
        <Route path='/dentalchart' element={<DentalChartForm/>}/>
        <Route path='/viewdental' element={<ViewDentalChart/>}/>




        {/* editContent by super admin */}
        <Route path="/editContent" element={<EditContent />} />
        <Route path="/testPreview" element={<TestPreview />} />


        {/* <Route path="/verify-email" element={<SuccessVerify />} /> */}
        {/*done responsive  */}
        {/* Public Routes */}
        <Route path="/" element={<App />} />
        <Route path="/home" element={<App />} />
        <Route path="/services" element={<Services />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot" element={<Forgot />} />
        
        {/* protected route for verify email */}
        <Route
          path="/verify-email"
          element={
            <ProtectedVerificationRoute>
              <SuccessVerify />
            </ProtectedVerificationRoute>
          }
        />
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
          <ProtectedRoute allowedRoles={["patient", "doctor"]}>
        <MessagePage />
        </ProtectedRoute>
        } />

        {/* appointmentStepThree design */}
        {/* done responsive */}
        <Route 
          path="/appointment" 
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <Appointment />
            </ProtectedRoute>
          } 
        />
        {/* remove the admin route once done */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute allowedRoles={["patient", "admin", "doctor" ]}>
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

        <Route 
          path="/doctorDashboard" 
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all route - Redirect to home for any undefined routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
