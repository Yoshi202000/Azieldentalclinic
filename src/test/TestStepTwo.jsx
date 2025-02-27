import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../pages/Appointment/Appointment.css';

const TestStepTwo = ({ selectedDoctor, onScheduleSelect }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterEmail, setFilterEmail] = useState(selectedDoctor || '');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/all-schedules`);
        setSchedules(response.data); // Assuming response.data contains the schedules
      } catch (err) {
        setError('Failed to fetch schedules');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Filter schedules by email
  const filteredSchedules = schedules.filter(schedule =>
    schedule.email.toLowerCase().includes(filterEmail.toLowerCase())
  );

  const handleScheduleClick = (schedule) => {
    setSelectedSchedule(schedule);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    if (selectedSchedule) {
      // Format the time slot
      const formattedTimeSlot = `${slot.timeFrom} → ${slot.timeTo}`;

      onScheduleSelect({
        date: selectedSchedule.date,
        timeFrom: slot.timeFrom,
        timeTo: slot.timeTo,
        appointmentTimeFrom: formattedTimeSlot, // Ensure correct format
        doctorEmail: selectedSchedule.email,
        doctorFirstName: selectedSchedule.firstName,
        doctorLastName: selectedSchedule.lastName,
        bookedClinic: selectedSchedule.clinic,
      });
    }
  };

  return (
    <div className="appointment-date">
      <h2>Select a Schedule</h2>
      <input
        type="text"
        readOnly
        placeholder="Filter by email"
        value={filterEmail}
        onChange={(e) => setFilterEmail(e.target.value)}
        className="filter-input"
      />
      <div className="calendar-time-container">
        <div className="calendar-container">
          <ul className="calendar">
            {filteredSchedules.length > 0 ? (
              filteredSchedules.map((schedule) => (
                <li key={schedule._id} className="available" onClick={() => handleScheduleClick(schedule)}>
                  <span>
                    Dr. {schedule.firstName} {schedule.lastName} - {new Date(schedule.date).toLocaleDateString()}
                  </span>
                </li>
              ))
            ) : (
              <li>No schedules available</li>
            )}
          </ul>
        </div>

        {selectedSchedule && (
          <div className="time-slots-container">
            <h3>Available Slots for {new Date(selectedSchedule.date).toLocaleDateString()}</h3>
            <ul className="time-slots">
              {selectedSchedule.slots
                .filter(slot => slot.status === 'Available') // Only show available slots
                .map((slot, index) => (
                  <li key={index} onClick={() => handleSlotSelect(slot)} style={{ cursor: 'pointer' }}>
                    {slot.timeFrom} - {slot.timeTo} 
                  </li>
                ))}
            </ul>
            {selectedSchedule.slots.every(slot => slot.status !== 'Available') && (
              <p>No available slots for this date.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestStepTwo;