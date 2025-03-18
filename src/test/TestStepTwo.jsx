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
  const [slotCount, setSlotCount] = useState(1);
  const [selectedSlots, setSelectedSlots] = useState([]);

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

  // Filter schedules by email only if filterEmail is not empty
  const filteredSchedules =
    filterEmail.trim() !== ''
      ? schedules.filter((schedule) =>
          schedule.email.toLowerCase().includes(filterEmail.toLowerCase())
        )
      : [];

  const handleScheduleClick = (schedule) => {
    setSelectedSchedule(schedule);
    setSelectedSlot(null);
    setSelectedSlots([]);
  };

  const handleSlotSelect = (slot, mainID, index) => {
    if (selectedSlots.length === 0 || selectedSlots.length === slotCount) {
      setSelectedSlots([{ slot, index }]);
      setSelectedSlot(slot);
    } else {
      const lastSelectedIndex = selectedSlots[selectedSlots.length - 1].index;
      if (index === lastSelectedIndex + 1) {
        if (selectedSlots.length < slotCount) {
          const newSelectedSlots = [...selectedSlots, { slot, index }];
          setSelectedSlots(newSelectedSlots);
          
          if (newSelectedSlots.length === slotCount) {
            const firstSlot = newSelectedSlots[0].slot;
            const lastSlot = newSelectedSlots[newSelectedSlots.length - 1].slot;
            
            const formattedTimeSlot = `${firstSlot.timeFrom} → ${lastSlot.timeTo}`;
            
            onScheduleSelect({
              mainID: mainID,
              slotID: newSelectedSlots.map(s => s.slot._id).join(','),
              date: selectedSchedule.date,
              timeFrom: firstSlot.timeFrom,
              timeTo: lastSlot.timeTo,
              appointmentTimeFrom: formattedTimeSlot,
              doctorEmail: selectedSchedule.email,
              doctorFirstName: selectedSchedule.firstName,
              doctorLastName: selectedSchedule.lastName,
              bookedClinic: selectedSchedule.clinic,
              slotStatus: 'Available',
              selectedSlots: newSelectedSlots.map(s => s.slot),
            });
          }
        }
      } else {
        setSelectedSlots([{ slot, index }]);
      }
    }
  };

  const isSlotSelected = (index) => {
    return selectedSlots.some(s => s.index === index);
  };

  return (
    <div className="appointment-date">
      <h2>Select a Schedule</h2>

      <div className="slot-count-selector">
        <label htmlFor="slotCount">Number of consecutive slots needed: </label>
        <input 
          type="number" 
          id="slotCount" 
          min="1" 
          max="10" 
          value={slotCount} 
          onChange={(e) => {
            const value = parseInt(e.target.value);
            setSlotCount(value > 0 ? value : 1);
            setSelectedSlots([]);
          }} 
        />
      </div>

      {filterEmail.trim() === '' ? (
        <p style={{ textAlign: 'center', color: 'gray' }}>Please select a doctor to see schedules.</p>
      ) : (
        
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
              <p>Please select {slotCount} consecutive time slot{slotCount > 1 ? 's' : ''}</p>
              <ul className="time-slots">
                {selectedSchedule.slots
                  .filter((slot) => slot.status === 'Available') // Only show available slots
                  .map((slot, index) => (
                    <li 
                      key={index} 
                      onClick={() => handleSlotSelect(slot, selectedSchedule._id, index)} 
                      style={{ 
                        cursor: 'pointer',
                        backgroundColor: isSlotSelected(index) ? '#4CAF50' : '',
                        color: isSlotSelected(index) ? 'white' : ''
                      }}
                    >
                      {slot.timeFrom} - {slot.timeTo}
                    </li>
                  ))}
              </ul>
              {selectedSchedule.slots.every((slot) => slot.status !== 'Available') && (
                <p>No available slots for this date.</p>
              )}
              
              {selectedSlots.length > 0 && selectedSlots.length < slotCount && (
                <p>Please select {slotCount - selectedSlots.length} more consecutive slot{slotCount - selectedSlots.length > 1 ? 's' : ''}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestStepTwo;
