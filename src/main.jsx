import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import global styles
import './index.css';

// Import page components
import App from './pages/App/App.jsx';
import Login from './pages/login/login.jsx';
import Signup from './pages/Signup/Signup.jsx';
import Appointment from './pages/Appointment/Appointment.jsx';

// Test components (for testing purposes)
import Drawer from './component/Drawers.jsx';
import First from './component/First.jsx';
import Test from './pages/test/test.jsx';
import Chat from './component/chat.jsx';
import Manager from './admin/manager/Manager.jsx';
import HomeButton from './component/HomeButton.jsx';
import AppointmentStepThreetest from './pages/test/testAppointment.jsx';
import Profile from './pages/Profile/Profile.jsx';
import TestAppointment from './pages/test/apptest.jsx';



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Main Routes */}
        <Route path="/" element={<App />} />
        <Route index element={<App />} />
        <Route path="/home" element={<App />} />
        <Route path="/homepage" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/appointment" element={<Appointment />} />

        {/* Test Routes */}
        <Route path="/first" element={<First />} />
        <Route path="/drawer" element={<Drawer />} />
        <Route path="/test" element={<Test />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/manager" element={<Manager/>} />
        <Route path='/button' element={<HomeButton/>}/>
        <Route path='/Profile' element={<Profile/>}/>
        <Route path="/testAppoint" element={<AppointmentStepThreetest />} />
        <Route path="/testapp" element={<TestAppointment />} />

      </Routes>
    </BrowserRouter>
  </StrictMode>
);
