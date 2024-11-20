import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SuccessVerify.css';
import HomeButton from '../../component/HomeButton';

function SuccessVerify() {
    const navigate = useNavigate();

    const handleLoginRedirect = () => {
        navigate('/login'); // Redirect user to login page
    };

    return (
        <div className="success-verify-container">
            <div className="home-button-container">
                <HomeButton />
            </div>
            <div className="success-message-box">
                <h1>Email Verified Successfully!</h1>
                <p>You can now log in to your account.</p>
                <button onClick={handleLoginRedirect} className="login-button">
                    Go to Login
                </button>
            </div>
        </div>
    );
}

export default SuccessVerify;
