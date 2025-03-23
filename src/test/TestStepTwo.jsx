import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../pages/Appointment/Appointment.css';

const TestStepTwo = ({ selectedDoctor, onScheduleSelect, requiredSlots = 1 }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterEmail, setFilterEmail] = useState(selectedDoctor || '');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotCount, setSlotCount] = useState(requiredSlots);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [validStartingSlots, setValidStartingSlots] = useState([]);

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

  useEffect(() => {
    setSlotCount(requiredSlots);
  }, [requiredSlots]);

  // Function to check if slots are consecutive
  const areConsecutiveSlots = (slots) => {
    if (!slots || slots.length < 2) return true;
    
    // Sort slots by timeFrom
    const sortedSlots = [...slots].sort((a, b) => {
      const timeA = a.timeFrom.split(':').map(Number);
      const timeB = b.timeFrom.split(':').map(Number);
      return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
    });
    
    // Check if each slot's timeTo matches the next slot's timeFrom
    for (let i = 0; i < sortedSlots.length - 1; i++) {
      if (sortedSlots[i].timeTo !== sortedSlots[i + 1].timeFrom) {
        return false;
      }
    }
    
    return true;
  };

  // Function to find valid starting slots that allow consecutive selection
  const findValidStartingIndices = (availableSlots, neededCount) => {
    if (!availableSlots || availableSlots.length === 0) return [];
    
    // Sort slots by timeFrom
    const sortedSlots = [...availableSlots].sort((a, b) => {
      const timeA = a.timeFrom.split(':').map(Number);
      const timeB = b.timeFrom.split(':').map(Number);
      return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
    });
    
    const validIndices = [];
    
    // Check each potential starting position
    for (let i = 0; i < sortedSlots.length; i++) {
      if (i + neededCount > sortedSlots.length) break;
      
      // Get the potential consecutive slots
      const potentialSlots = sortedSlots.slice(i, i + neededCount);
      
      // Check if these slots are consecutive
      if (areConsecutiveSlots(potentialSlots)) {
        validIndices.push(i);
      }
    }
    
    return validIndices;
  };

  // Update valid starting slots when selected schedule or slot count changes
  useEffect(() => {
    if (selectedSchedule) {
      const availableSlots = selectedSchedule.slots.filter(slot => slot.status === 'Available');
      const validIndices = findValidStartingIndices(availableSlots, slotCount);
      setValidStartingSlots(validIndices);
    }
  }, [selectedSchedule, slotCount]);

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
    
    // Calculate valid starting slots when a schedule is selected
    const availableSlots = schedule.slots.filter(slot => slot.status === 'Available');
    const validIndices = findValidStartingIndices(availableSlots, slotCount);
    setValidStartingSlots(validIndices);
  };

  const handleSlotSelect = (slot, mainID, index, availableSlots) => {
    // Sort slots by timeFrom
    const sortedSlots = [...availableSlots].sort((a, b) => {
      const timeA = a.timeFrom.split(':').map(Number);
      const timeB = b.timeFrom.split(':').map(Number);
      return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
    });
    
    // Check if this is a valid starting slot
    if (!validStartingSlots.includes(index)) {
      alert(`Cannot select ${slotCount} consecutive slots from this position.`);
      return;
    }
    
    // Get the consecutive slots starting from the selected one
    const selectedConsecutiveSlots = sortedSlots.slice(index, index + slotCount);
    
    // Create the selected slots array with indices
    const newSelectedSlots = selectedConsecutiveSlots.map((slot, i) => ({
      slot,
      index: index + i
    }));
    
    setSelectedSlots(newSelectedSlots);
    setSelectedSlot(slot); // Set the first slot as the selected one
    
    // Get the first and last slot for the time range
    const firstSlot = newSelectedSlots[0].slot;
    const lastSlot = newSelectedSlots[newSelectedSlots.length - 1].slot;
    
    // Format the time slot range - only showing timeFrom of first slot and timeTo of last slot
    const formattedTimeSlot = `${firstSlot.timeFrom} → ${lastSlot.timeTo}`;
    
    // Create an array of all time slots for the appointmentTimeFrom array
    const timeFromArray = newSelectedSlots.map(s => `${s.slot.timeFrom} - ${s.slot.timeTo}`);
    
    onScheduleSelect({
      mainID: mainID,
      slotID: newSelectedSlots.map(s => s.slot._id).join(','), // Keep for backward compatibility
      date: selectedSchedule.date,
      timeFrom: firstSlot.timeFrom, // First slot's timeFrom
      timeTo: lastSlot.timeTo,      // Last slot's timeTo
      appointmentTimeFrom: timeFromArray, // Array of all selected time slots
      formattedTimeSlot: formattedTimeSlot, // For display purposes
      doctorEmail: selectedSchedule.email,
      doctorFirstName: selectedSchedule.firstName,
      doctorLastName: selectedSchedule.lastName,
      bookedClinic: selectedSchedule.clinic,
      slotStatus: 'Available',
      selectedSlots: newSelectedSlots.map(s => s.slot), // Pass all selected slots
      slotCount: slotCount, // Pass the slot count
    });
  };

  const isSlotSelected = (index, availableSlots) => {
    // Sort slots by timeFrom
    const sortedSlots = [...availableSlots].sort((a, b) => {
      const timeA = a.timeFrom.split(':').map(Number);
      const timeB = b.timeFrom.split(':').map(Number);
      return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
    });
    
    return selectedSlots.some(s => {
      const slotIndex = sortedSlots.findIndex(slot => 
        slot.timeFrom === s.slot.timeFrom && slot.timeTo === s.slot.timeTo);
      return slotIndex === index;
    });
  };

  const isValidStartingSlot = (index) => {
    return validStartingSlots.includes(index);
  };

  const getCombinedTimeSlot = () => {
    if (selectedSlots.length === 0) return '';
    
    const firstSlot = selectedSlots[0].slot;
    const lastSlot = selectedSlots[selectedSlots.length - 1].slot;
    
    return `${firstSlot.timeFrom} → ${lastSlot.timeTo}`;
  };

  return (
    <div className="appointment-date">
      <h2>Select a Schedule</h2>

      <div className="slot-count-container">
        <label htmlFor="slotCount">Number of consecutive slots needed: </label>
        <input 
          type="number" 
          id="slotCount" 
          min="1" 
          max="10" 
          value={slotCount} 
          readOnly
          onChange={(e) => {
            const value = parseInt(e.target.value);
            const newSlotCount = value > 0 ? value : 1;
            setSlotCount(newSlotCount);
            setSelectedSlots([]);
            
            // Recalculate valid starting slots when slot count changes
            if (selectedSchedule) {
              const availableSlots = selectedSchedule.slots.filter(slot => slot.status === 'Available');
              const validIndices = findValidStartingIndices(availableSlots, newSlotCount);
              setValidStartingSlots(validIndices);
            }
          }} 
        />
        <p className="slot-info">Each slot is 30 minutes. Your selected services require {requiredSlots} slot(s).</p>
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
              <p>Select a starting time slot to book {slotCount} consecutive slot{slotCount > 1 ? 's' : ''}</p>
              
              {selectedSlots.length > 0 && (
                <div className="selected-time-range" style={{ 
                  padding: '10px', 
                  backgroundColor: '#e8f5e9', 
                  borderRadius: '5px',
                  marginBottom: '15px',
                  border: '1px solid #4CAF50'
                }}>
                  <h4>Selected Time Range:</h4>
                  <p style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{getCombinedTimeSlot()}</p>
                  <p>({slotCount} consecutive slot{slotCount > 1 ? 's' : ''})</p>
                </div>
              )}
              
              <ul className="time-slots">
                {(() => {
                  // Get available slots and sort them by time
                  const availableSlots = selectedSchedule.slots
                    .filter(slot => slot.status === 'Available')
                    .sort((a, b) => {
                      const timeA = a.timeFrom.split(':').map(Number);
                      const timeB = b.timeFrom.split(':').map(Number);
                      return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
                    });
                  
                  return availableSlots.map((slot, index) => {
                    const isValidStarting = isValidStartingSlot(index);
                    
                    return (
                      <li 
                        key={index} 
                        onClick={() => isValidStarting && handleSlotSelect(slot, selectedSchedule._id, index, availableSlots)} 
                        className={isValidStarting ? "" : "invalid-slot"}
                        style={{ 
                          cursor: isValidStarting ? 'pointer' : 'not-allowed',
                          backgroundColor: isSlotSelected(index, availableSlots) ? '#4CAF50' : 
                                          !isValidStarting ? '#f5f5f5' : '',
                          color: isSlotSelected(index, availableSlots) ? 'white' : 
                                 !isValidStarting ? '#aaa' : '',
                          opacity: isValidStarting ? 1 : 0.7,
                          position: 'relative'
                        }}
                      >
                        {slot.timeFrom} - {slot.timeTo}
                        {!isValidStarting && slotCount > 1 && (
                          <div className="tooltip">
                            Cannot select {slotCount} consecutive slots from here
                          </div>
                        )}
                      </li>
                    );
                  });
                })()}
              </ul>
              
              {selectedSchedule.slots.filter(slot => slot.status === 'Available').length === 0 && (
                <p>No available slots for this date.</p>
              )}
              
              {selectedSchedule.slots.filter(slot => slot.status === 'Available').length > 0 && 
               validStartingSlots.length === 0 && (
                <p className="warning-message">
                  <strong>Note:</strong> There are no valid starting positions for {slotCount} consecutive slots on this date.
                  Please try a different date or reduce the number of slots needed.
                </p>
              )}
            </div>
          )}
        </div>
      )}
      
      <style>{`
        .invalid-slot:hover .tooltip {
          display: block;
        }
        
        .tooltip {
          display: none;
          position: absolute;
          background: #333;
          color: white;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 12px;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          z-index: 10;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        
        .tooltip:after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          margin-left: -5px;
          border-width: 5px;
          border-style: solid;
          border-color: #333 transparent transparent transparent;
        }
        
        .warning-message {
          background-color: #fff3cd;
          color: #856404;
          padding: 10px;
          border-radius: 4px;
          border-left: 4px solid #ffeeba;
          margin-top: 15px;
        }
      `}</style>
    </div>
  );
};

export default TestStepTwo;
