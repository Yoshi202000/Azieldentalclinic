import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '../utils/auth';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
    const [auth, setAuth] = useState(null); // null = loading, true = authenticated, false = not authenticated

    useEffect(() => {
        const verifyAuth = async () => {
            if (!isLoggedIn()) {
                setAuth(false);
                return;
            }

            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/verify-token`, {
                    headers: {
                        'Authorization': `${localStorage.getItem('token')}`, // If using Bearer tokens
                    },
                    withCredentials: true, // If backend uses cookies
                });

                if (response.status === 200) {
                    setAuth(true);
                } else {
                    setAuth(false);
                }
            } catch (error) {
                setAuth(false);
            }
        };

        verifyAuth();
    }, []);

    if (auth === null) {
        return <div>Loading...</div>; // You can replace this with a spinner or skeleton
    }

    return auth ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
