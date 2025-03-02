import React from 'react';
import axios from 'axios';
import DentalChartForm from './DentalChart'; // Import the DentalChartForm component

const UpdateFee = ({ selectedAppointment, onClose, onSuccess, onComplete }) => {
    const handleUpdate = async () => {
        try {
            // Your logic to update the fee
            await axios.post('/api/update-fee', { appointmentId: selectedAppointment });
            onSuccess(); // Notify parent component of success
        } catch (error) {
            console.error('Error updating fee:', error);
        }
    };

    const handleComplete = () => {
        onComplete(); // Call the onComplete function passed from the parent
    };

    return (
        <div className="updateFee-modal">
            <h2>Update Fee</h2>
            {/* Your fee update form elements */}
            <button onClick={handleUpdate}>Confirm Fee Update</button>
            <button onClick={handleComplete}>Complete Appointment</button> {/* New button for completing the appointment */}
            <button onClick={onClose}>Cancel</button>
        </div>
    );
};

export default UpdateFee; 