import React from 'react';
import { generateAvailableDates } from '../../utils/appDate'; // Ensure correct import

const DoctorsCalendar = ({
  selectedDate,
  handleDateSelect,
  generateTimeSlots,
  handleTimeSelect,
  bookedAppointments,
  newSchedules = [], // Ensure newSchedules is always defined
}) => {
  const isTimeSlotSelected = (date, timeFrom, timeTo) => {
    const selectedDateSchedule = newSchedules.find((schedule) => schedule.date === date);
    if (!selectedDateSchedule || !selectedDateSchedule.timeSlots) {
      return false;
    }
    return selectedDateSchedule.timeSlots.some(
      (slot) => slot.timeFrom === timeFrom && slot.timeTo === timeTo
    );
  };

  const isTimeSlotBooked = (date, timeFrom, timeTo) => {
    console.log('Checking if slot is booked:', { date, timeFrom, timeTo });
    console.log('Booked appointments:', bookedAppointments);
    return bookedAppointments.some(
      (appointment) => 
        new Date(appointment.date).toDateString() === new Date(date).toDateString() && 
        appointment.timeFrom === timeFrom && 
        appointment.timeTo === timeTo
    );
  };

  return (
    <div className='appointment-date'>
      <h2>Available Dates</h2>
      <div className='calendar-time-container'>
        <div className='calendar-container'>
          <ul className='calendar'>
            {Object.keys(generateAvailableDates()).map((date) => (
              <li
                key={date}
                className={selectedDate === date ? 'selected' : ''}
                onClick={() => handleDateSelect(date)}
              >
                {date}
              </li>
            ))}
          </ul>
        </div>
        {selectedDate && (
          <div className='time-slots-container'>
            <h3>Available Times for {selectedDate}</h3>
            <ul className='time-slots'>
              {generateTimeSlots(9, 18).map((time, index) => {
                const nextTime = generateTimeSlots(9, 18)[index + 1];
                if (!nextTime) return null;

                const timeFrom = time;
                const timeTo = nextTime;

                if (isTimeSlotBooked(selectedDate, timeFrom, timeTo)) {
                  console.log('Slot is booked, skipping:', { selectedDate, timeFrom, timeTo });
                  return null; // Skip rendering if the slot is booked
                }

                return (
                  <li
                    key={index}
                    className={isTimeSlotSelected(selectedDate, timeFrom, timeTo) ? 'selected' : ''}
                    onClick={() => {
                      console.log('Time slot clicked:', selectedDate, timeFrom, timeTo); // Debug log
                      handleTimeSelect(selectedDate, timeFrom, timeTo);
                    }}
                  >
                    {timeFrom} - {timeTo}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorsCalendar;
