import React, { useEffect, useState } from 'react';
import BulkGenerateSchedule from './GenerateSchedule';
import axios from 'axios';

const DoctorDashboard = () => {
    const [doctor, setDoctor] = useState(null);

    useEffect(() => {
        const fetchDoctorData = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/verify-token`, {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                });

                setDoctor(response.data.user);
            } catch (error) {
                console.error('Failed to fetch doctor data:', error);
            }
        };

        fetchDoctorData();
    }, []);

    return (
        <div>
            {doctor ? <BulkGenerateSchedule doctor={doctor} /> : <p>Loading doctor details...</p>}
        </div>
    );
};

export default DoctorDashboard;
