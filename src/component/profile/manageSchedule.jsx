import React, { useEffect, useState } from 'react';
import DoctorsCalendar from '../appointmentPage/DoctorsCalendar';
import { useNavigate } from 'react-router-dom';
import './ManageSchedule.css';

const ManageSchedule = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeFrom, setSelectedTimeFrom] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [newSchedules, setNewSchedules] = useState([]);
  const [userData, setUserData] = useState({
    
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dob: '',
    role: '',
    clinic: '',
    greetings: '',
    description: '',
    services: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to continue.');
        navigate('/login');
        return;
      }
      

      try {
        const verifyTokenResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/verify-token`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (!verifyTokenResponse.ok) {
          throw new Error('Failed to fetch data from the token.');
        }

        const verifyTokenData = await verifyTokenResponse.json();

        const {
          firstName,
          lastName,
          email,
          phoneNumber,
          dob,
          role,
          clinic,
          greetings,
          description,
          services,
        } = verifyTokenData.user || {};

        setUserData({
          firstName,
          lastName,
          email,
          phoneNumber,
          dob: dob || '',
          role,
          clinic,
          greetings: greetings || '',
          description: description || '',
          services: Array.isArray(services) ? services.map((service) => service.name) : [],
        });

        const schedulesResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/schedule`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!schedulesResponse.ok) {
          throw new Error('Failed to fetch schedules.');
        }

        const schedulesData = await schedulesResponse.json();
        console.log('Fetched schedules:', schedulesData);

        const enrichedSchedules = schedulesData.map(schedule => ({
          ...schedule,
          email: schedule.email || 'No email provided',
          clinic: schedule.clinic || 'No clinic provided',
        }));

        setSchedules(enrichedSchedules);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert(error.message || 'An unexpected error occurred.');
        navigate('/login');
      }
    };

    fetchData();
  }, [navigate]);

  const isTimeSlotSelected = (date, timeFrom, timeTo) => {
    const selectedDateSchedule = newSchedules.find((schedule) => schedule.date === date);
    if (!selectedDateSchedule || !selectedDateSchedule.timeSlots) {
      return false;
    }
  
    const isSelected = selectedDateSchedule.timeSlots.some(
      (slot) => slot.timeFrom === timeFrom && slot.timeTo === timeTo
    );
  
    console.log('Is time slot selected:', { date, timeFrom, timeTo, isSelected });
    return isSelected;
  };  

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const existingSchedule = newSchedules.find((schedule) => schedule.date === date);
    if (!existingSchedule) {
      setNewSchedules((prev) => [...prev, { date, timeSlots: [] }]); // Initialize timeSlots as an empty array
    }
  };  

  const handleTimeSelect = (date, timeFrom, timeTo) => {
    console.log('Before state update:', newSchedules);
  
    setNewSchedules((prev) => {
      const updatedSchedules = prev.map((schedule) => {
        if (schedule.date === date) {
          // Make a copy of the current timeSlots
          const timeSlots = schedule.timeSlots ? [...schedule.timeSlots] : [];
  
          // Check if the time slot is already selected
          const existingSlotIndex = timeSlots.findIndex(
            (slot) => slot.timeFrom === timeFrom && slot.timeTo === timeTo
          );
  
          if (existingSlotIndex === -1) {
            // Add the time slot if it's not already selected
            timeSlots.push({ timeFrom, timeTo });
          } else {
            // Remove the time slot if it's already selected
            timeSlots.splice(existingSlotIndex, 1);
          }
  
          // Return the updated schedule with the modified timeSlots
          return { ...schedule, timeSlots };
        }
  
        return schedule; // Return other schedules unchanged
      });
  
      // If the date doesn't exist, add a new schedule
      if (!updatedSchedules.some((schedule) => schedule.date === date)) {
        updatedSchedules.push({ date, timeSlots: [{ timeFrom, timeTo }] });
      }
  
      console.log('After state update:', updatedSchedules);
      return updatedSchedules;
    });
  };
  
  const generateFullDaySlots = (startHour = 9, endHour = 18) => {
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour}:00`, `${hour}:30`);
    }
    return slots;
  };
  
  // Function to handle selecting all time slots for a date
  const handleSelectAllDay = (date) => {
    const fullDaySlots = generateFullDaySlots(); // Generate all time slots
    setNewSchedules((prev = []) => {
      const existingScheduleIndex = prev.findIndex((schedule) => schedule.date === date);
  
      if (existingScheduleIndex > -1) {
        const updatedSchedules = [...prev];
        updatedSchedules[existingScheduleIndex].timeSlots = fullDaySlots.map((timeFrom) => ({
          timeFrom,
          timeTo: calculateTimeTo(timeFrom),
        }));
        return updatedSchedules;
      } else {
        return [
          ...prev,
          {
            date,
            timeSlots: fullDaySlots.map((timeFrom) => ({
              timeFrom,
              timeTo: calculateTimeTo(timeFrom),
            })),
          },
        ];
      }
    });
  };

  const handleDeleteSlot = (date, timeFrom, timeTo) => {
    setNewSchedules((prev) => {
      const updatedSchedules = prev.map((schedule) => {
        if (schedule.date === date) {
          return {
            ...schedule,
            timeSlots: schedule.timeSlots.filter(
              (slot) => slot.timeFrom !== timeFrom || slot.timeTo !== timeTo
            ),
          };
        }
        return schedule;
      });
  
      // Remove schedules that have no time slots left
      return updatedSchedules.filter((schedule) => schedule.timeSlots.length > 0);
    });
  };
  
  // Optional: Calculate `timeTo` based on `timeFrom` if `timeTo` is not provided
  const calculateTimeTo = (timeFrom) => {
    const [hour, minute] = timeFrom.split(':').map(Number);
    const newTime = new Date();
    newTime.setHours(hour, minute + 30); // Add 30 minutes to timeFrom
    return newTime.toTimeString().slice(0, 5); // Returns HH:mm
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    setIsSubmitting(true);
  
    if (newSchedules.some((schedule) => !schedule.timeSlots || schedule.timeSlots.length === 0)) {
      alert('Please select at least one time slot for each date before submitting.');
      setIsSubmitting(false);
      return;
    }
  
    const formattedSchedules = newSchedules.flatMap((schedule) =>
      schedule.timeSlots.map((slot) => ({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        clinic: userData.clinic || 'Default Clinic',
        services: userData.services.length > 0 ? userData.services : ['Default Service'],
        date: new Date(schedule.date).toISOString(),
        timeFrom: slot.timeFrom,
        timeTo: slot.timeTo,
      }))
    );
  
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/schedule/bulk`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schedules: formattedSchedules }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to save schedules.');
      }
  
      const savedSchedules = await response.json();
      alert('Schedules saved successfully!');
      setNewSchedules([]);
      setSchedules((prev) => [...prev, ...savedSchedules]);
    } catch (error) {
      console.error('Error saving schedules:', error);
      alert(error.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };   

  const handleDeleteAllDay = (date) => {
    setNewSchedules((prev) => prev.filter((schedule) => schedule.date !== date));
  };
  
  const handleSelectAllDatesAndTimes = () => {
    setNewSchedules((prev) => {
      const updatedSchedules = schedules.map((schedule) => {
        const fullDaySlots = generateFullDaySlots();
        return {
          date: schedule.date,
          timeSlots: fullDaySlots.map((timeFrom) => ({
            timeFrom,
            timeTo: calculateTimeTo(timeFrom),
          })),
        };
      });
  
      return updatedSchedules;
    });
  };
  

  if (loading) {
    return <p>Loading schedules...</p>;
  }

  return (
    <div className="container">
  <h1>Manage Doctor Availability</h1>
  <div className="info-section">
    <h2>Doctor Information</h2>
    <p><strong>Name:</strong> {userData.firstName} {userData.lastName}</p>
    <p><strong>Email:</strong> {userData.email}</p>
    <p><strong>Phone Number:</strong> {userData.phoneNumber}</p>
    <p><strong>Clinic:</strong> {userData.clinic}</p>
    <p><strong>Services:</strong> {userData.services.join(', ')}</p>
  </div>

  {/* Add the Select All Dates and Times button */}
  <button onClick={handleSelectAllDatesAndTimes}>Select All Dates and Times</button>

  <DoctorsCalendar
  selectedDate={selectedDate}
  handleDateSelect={handleDateSelect}
  generateTimeSlots={(start, end) => {
    const slots = [];
    for (let i = start; i < end; i++) {
      slots.push(`${i}:00`, `${i}:30`);
    }
    return slots;
  }}
  handleTimeSelect={handleTimeSelect}
  newSchedules={newSchedules}
  bookedAppointments={schedules
    .filter((schedule) => schedule.email === userData.email) // Filter by user's email
    .map((schedule) => ({
      date: schedule.date,
      timeFrom: schedule.timeFrom,
      timeTo: schedule.timeTo,
    }))}
/>


  <div className="selected-schedules">
    <h3>Selected Schedules</h3>
    {Array.isArray(newSchedules) && newSchedules.length > 0 ? (
      <ul>
        {newSchedules.map((schedule, index) => (
          <li key={index}>
            <div>
              <strong>Date:</strong> {schedule.date}{' '}
              <button onClick={() => handleSelectAllDay(schedule.date)}>Select All Day</button>{' '}
              <button onClick={() => handleDeleteAllDay(schedule.date)}>Delete All Day</button>
              <ul>
                {Array.isArray(schedule.timeSlots) &&
                  schedule.timeSlots.map((slot, slotIndex) => (
                    <li key={slotIndex}>
                      <span>
                        {slot.timeFrom} - {slot.timeTo}{' '}
                        <button
                          onClick={() => handleDeleteSlot(schedule.date, slot.timeFrom, slot.timeTo)}
                        >
                          Delete Slot
                        </button>
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <p>No schedules selected yet.</p>
    )}
  </div>
  <button
    onClick={handleSubmit}
    disabled={
      isSubmitting || 
      newSchedules.length === 0 || 
      newSchedules.some((schedule) => !schedule.timeSlots || schedule.timeSlots.length === 0)
    }
      >
        {isSubmitting ? 'Saving...' : 'Submit Schedules'}
    </button>
</div>

  );
  
};

export default ManageSchedule;
