// AppointmentStepTwo.jsx
import React from 'react';

const AppointmentStepTwo = ({ 
  availableDates, 
  selectedDate, 
  handleDateSelect, 
  generateTimeSlots, 
  selectedTimeFrom, 
  handleTimeSelect,
  bookedAppointments
}) => {
  const isTimeSlotBooked = (date, time) => {
    return bookedAppointments.some(appointment => 
      appointment.appointmentDate === date && appointment.appointmentTimeFrom === time
    );
  };
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
            <h3>Available Time on {selectedDate}</h3>
            <ul className="time-slots">
              {generateTimeSlots(9, 18).map((time, index) => {
                const isBooked = isTimeSlotBooked(selectedDate, time);
                if (!isBooked) {
                  return (
                    <li
                      key={index}
                      className={selectedTimeFrom === time ? 'selected' : ''}
                      onClick={() => handleTimeSelect('from', time)}
                    >
                      {time}
                    </li>
                  );
                }
                return null; // This will hide the booked time slots
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
export default AppointmentStepTwo;