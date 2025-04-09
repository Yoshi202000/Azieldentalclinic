import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { isLoggedIn } from '../utils/auth';
import axios from 'axios';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const [auth, setAuth] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const verifyAuth = async () => {
            console.log("Verifying auth...");
            if (!isLoggedIn()) {
                console.log("Not logged in");
                setAuth(false);
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/verify-token`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    withCredentials: true,
                });

                console.log("Auth response:", response.data);

                if (response.status === 200 && response.data.user && response.data.user.role) {
                    setAuth(true);
                    setUserRole(response.data.user.role);
                    console.log("User role:", response.data.user.role);
                } else {
                    console.log("Invalid response or missing role");
                    setAuth(false);
                }
            } catch (error) {
                console.error("Auth error:", error);
                setAuth(false);
            }
        };

        verifyAuth();
    }, []);

    useEffect(() => {
        console.log("Auth state:", auth);
        console.log("User role:", userRole);
        console.log("Allowed roles:", allowedRoles);

        if (auth === false) {
            navigate('/login');
        } else if (auth === true && userRole && allowedRoles && !allowedRoles.includes(userRole)) {
            navigate('/');
        }
    }, [auth, userRole, allowedRoles, navigate]);

    if (auth === null || userRole === null) {
        return <div>Loading...</div>;
    }

    if (auth === true && userRole && allowedRoles && allowedRoles.includes(userRole)) {
        return children;
    }

    return null;
};

export default ProtectedRoute;
