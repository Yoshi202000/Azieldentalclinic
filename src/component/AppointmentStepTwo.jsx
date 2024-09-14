// AppointmentStepTwo.jsx
import React from 'react';

const AppointmentStepTwo = ({ availableDates, selectedDate, handleDateSelect, generateTimeSlots, selectedTimeFrom, handleTimeSelect }) => {
  return (
    <div className="appointment-date">
      <h2>Select an Appointment</h2>
      <div className="calendar-time-container">
        <div className="calendar-container">
          <ul className="calendar">
            {Object.keys(availableDates).map((date) => (
              <li
                key={date}
                className={selectedDate === date ? 'available selected' : 'available'}
                onClick={() => handleDateSelect(date)}
              >
                <span>{date}</span>
              </li>
            ))}
          </ul>
        </div>
        {selectedDate && (
          <div className="time-slots-container">
            <h3>Available Times on {selectedDate}</h3>
            <ul className="time-slots">
              {generateTimeSlots(9, 18).map((time, index) => (
                <li
                  key={index}
                  className={selectedTimeFrom === time ? 'available selected' : 'available'}
                  onClick={() => handleTimeSelect('from', time)}
                  style={{
                    backgroundColor: selectedTimeFrom === time ? '#4D869C' : '#E3E3E3',
                    color: selectedTimeFrom === time ? 'white' : 'black',
                    padding: '10px',
                    margin: '5px 0',
                    borderRadius: '5px',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  {time}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentStepTwo;
