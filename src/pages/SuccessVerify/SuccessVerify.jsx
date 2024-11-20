import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SuccessVerify.css';
import HomeButton from '../../component/HomeButton';

function SuccessVerify() {
    const navigate = useNavigate();
    const location = useLocation();
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const status = queryParams.get('status');

        if (status === 'success') {
            setStatusMessage('Email verified successfully! You can now log in.');
        } else if (status === 'already-verified') {
            setStatusMessage('Your email has already been verified.');
        } else if (status === 'invalid-token') {
            setStatusMessage('Invalid or expired token. Please try again.');
        } else {
            console.warn('Unrecognized verification status:', status);
            setStatusMessage('An unknown error occurred.');
        }
    }, [location]);

    const handleLoginRedirect = () => {
        navigate('/login'); // Redirect user to login page
    };

    return (
        <div className="success-verify-container">
            <div className="home-button-container">
                <HomeButton />
            </div>
            <div className="success-message-box">
                <h1>{statusMessage}</h1>
                {statusMessage !== 'Invalid or expired token. Please try again.' && (
                    <button onClick={handleLoginRedirect} className="login-button" aria-label="Go to login page after successful verification">
                        Go to Login
                    </button>
                )}
            </div>
        </div>
    );
}

export default SuccessVerify;
