import React, { useState } from 'react';
import axios from 'axios';
import moment from 'moment';

const BulkGenerateSchedule = ({ doctor }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // Function to generate schedules for the next 60 days
    const generateSchedules = () => {
        const schedules = [];
        const today = moment().startOf('day');

        for (let i = 0; i < 60; i++) {
            const date = today.clone().add(i, 'days').format('YYYY-MM-DD');

            // Generate time slots from 9:00 AM to 6:00 PM
            const slots = [];
            let startTime = moment(date).set({ hour: 9, minute: 0 });

            while (startTime.hour() < 18) {
                const timeFrom = startTime.format('HH:mm');
                startTime.add(30, 'minutes');
                const timeTo = startTime.format('HH:mm');
                
                slots.push({ timeFrom, timeTo, status: "available" });
            }

            schedules.push({ date, slots });
        }

        return schedules;
    };

    // Function to submit schedules
    const handleGenerateSchedules = async () => {
        if (!doctor) {
            setMessage({ type: 'error', text: 'Doctor information is missing. Please log in.' });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const schedules = generateSchedules();

            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/schedule/bulk-generate`, 
                { schedule: schedules },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                }
            );

            if (response.status === 201) {
                setMessage({ type: 'success', text: 'Schedules successfully generated for the next 60 days!' });
            } else {
                setMessage({ type: 'error', text: response.data.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to generate schedules. Try again.' });
            console.error('Error generating schedules:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bulk-schedule-container">
            <h2>Bulk Generate Schedule</h2>
            <p>Generate schedules for the next 60 days with 30-minute time slots.</p>
            
            <button onClick={handleGenerateSchedules} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Schedules'}
            </button>

            {message && (
                <p className={message.type === 'success' ? 'success-msg' : 'error-msg'}>
                    {message.text}
                </p>
            )}
        </div>
    );
};

export default BulkGenerateSchedule;
