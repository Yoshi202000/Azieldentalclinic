import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import './testSchedule.css';
import 'react-datepicker/dist/react-datepicker.css';
import Spinner from './Spinner'; // Assume you have a Spinner component for loading indication

const TestSchedule = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    clinic: '',
    services: [],
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '18:00',
    slotDuration: 30,
  });

  const [schedule, setSchedule] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editDate, setEditDate] = useState(''); // State for the date to edit appointments
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSlots, setShowSlots] = useState(false); // State to track visibility of slots
  const [selectedDate, setSelectedDate] = useState('');
  const [editedSlots, setEditedSlots] = useState([]);
  const [previewSlots, setPreviewSlots] = useState([]);
  const [isGeneratingSlots, setIsGeneratingSlots] = useState(true); // Toggle between generating and editing
  const [nextAvailableDate, setNextAvailableDate] = useState(null);
  const [maxEndDate, setMaxEndDate] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to continue.');
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/verify-token`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data.');
        }

        const userData = await response.json();
        const {
          firstName,
          lastName,
          email,
          clinic,
          services,
        } = userData.user || {};

        setFormData((prevData) => ({
          ...prevData,
          firstName: firstName || '',
          lastName: lastName || '',
          email: email || '',
          clinic: clinic || '',
          services: Array.isArray(services) ? services.map((service) => service.name) : [],
        }));

        // Fetch user's schedules after verifying token
        const schedulesResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/schedules`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!schedulesResponse.ok) {
          throw new Error('Failed to fetch user schedules.');
        }

        const userSchedules = await schedulesResponse.json();
        setSchedule(userSchedules); // Set the fetched schedules to state

        // Determine the next available date
        const today = new Date();
        const nextDay = new Date(today);
        nextDay.setDate(today.getDate() + 1);
        const nextAvailable = userSchedules.find(day => new Date(day.date) >= nextDay);
        setNextAvailableDate(nextAvailable ? nextAvailable.date : nextDay.toISOString().split('T')[0]);

        // Set maximum end date to 60 days from today
        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + 60);
        setMaxEndDate(maxDate.toISOString().split('T')[0]);

      } catch (error) {
        console.error('Error fetching user data:', error);
        alert(error.message || 'An unexpected error occurred.');
        navigate('/login');
      }
    };

    const fetchSchedules = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMessage('Please log in to continue.');
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/schedules`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          setSchedule(response.data); // Set the fetched schedules to state
        } else {
          setErrorMessage('Failed to fetch schedules.');
        }
      } catch (error) {
        console.error('Error fetching schedules:', error);
        // Check if the error response exists and log the message
        if (error.response) {
          setErrorMessage('Failed to fetch schedules: ' + (error.response.data.message || error.message));
        } else {
          setErrorMessage('Failed to fetch schedules: ' + error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchSchedules();
  }, [navigate]);

  useEffect(() => {
    if (formData.startDate) {
      const endDate = new Date(formData.startDate);
      endDate.setDate(endDate.getDate() + 59); // 60 days total
      setFormData((prevData) => ({
        ...prevData,
        endDate: endDate.toISOString().split('T')[0],
      }));
    }
  }, [formData.startDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleServiceChange = (service) => {
    setFormData((prevData) => {
      const services = prevData.services.includes(service)
        ? prevData.services.filter((s) => s !== service)
        : [...prevData.services, service];
      return { ...prevData, services };
    });
  };

  const generateSlotsForDay = (date) => {
    const slots = [];
    const startTime = new Date(`1970-01-01T${formData.startTime}:00`);
    const endTime = new Date(`1970-01-01T${formData.endTime}:00`);
    const duration = formData.slotDuration;

    while (startTime < endTime) {
      const timeFrom = startTime.toTimeString().slice(0, 5);
      startTime.setMinutes(startTime.getMinutes() + duration);
      const timeTo = startTime.toTimeString().slice(0, 5);
      slots.push({ timeFrom, timeTo, status: 'Available' });
    }

    return slots; // Return the array of slots for the specific date
  };

  const handleGenerateSlots = () => {
    if (!formData.startDate || !formData.endDate || !formData.startTime || !formData.endTime) {
      alert('Please fill in all fields to generate slots.');
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    // Check if the end date is within the maximum allowed range
    if (endDate > new Date(maxEndDate)) {
      alert(`You can only create slots up to ${maxEndDate}`);
      return;
    }

    const newSlots = [];

    // Generate slots for each date in the range
    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      const slotsForDate = generateSlotsForDay(dateString); // Generate slots for the specific date
      newSlots.push({ date: dateString, slots: slotsForDate }); // Push an object with date and slots
    }

    setPreviewSlots(newSlots); // Set the generated slots for preview
  };

  const handleSlotStatusChange = (dateIndex, slotIndex, status) => {
    // Check if editedSlots and the specific slot exist
    if (editedSlots[slotIndex]) {
      const updatedEditedSlots = [...editedSlots];
      updatedEditedSlots[slotIndex].status = status; // Update the status of the selected slot
      setEditedSlots(updatedEditedSlots);
    } else {
      console.error('Invalid slot index or slots not found:', slotIndex, editedSlots);
    }
  };

  const makeAllAvailable = (dateIndex) => {
    const updatedSlots = previewSlots[dateIndex].slots.map(slot => ({ ...slot, status: 'Available' }));
    setPreviewSlots(prev => {
      const newPreview = [...prev];
      newPreview[dateIndex].slots = updatedSlots;
      return newPreview;
    });
  };

  const makeAllUnavailable = (dateIndex) => {
    const updatedSlots = previewSlots[dateIndex].slots.map(slot => ({ ...slot, status: 'Unavailable' }));
    setPreviewSlots(prev => {
      const newPreview = [...prev];
      newPreview[dateIndex].slots = updatedSlots;
      return newPreview;
    });
  };

  const finalizeSlots = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to continue.');
      return;
    }

    // Iterate over each date in previewSlots and send a separate request
    for (const dateSlot of previewSlots) {
      const requestData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        clinic: formData.clinic,
        services: formData.services,
        date: dateSlot.date, // Set the date for this specific slot
        slots: dateSlot.slots.map(slot => ({
          timeFrom: slot.timeFrom,
          timeTo: slot.timeTo,
          status: slot.status,
        })),
      };

      console.log('Request Data for date:', dateSlot.date, requestData); // Log the request data for debugging

      try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/schedule`, requestData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 201) {
          console.log(`Slots for ${dateSlot.date} saved successfully!`);
          alert(`Schedule added successfully for ${dateSlot.date}`); // Success message
        }
      } catch (error) {
        console.error('Error saving slots for date:', dateSlot.date, error); // Log the error for debugging
        if (error.response) {
          console.error('Error Response Data:', error.response.data); // Log the error response data
          alert('Failed to save slots for ' + dateSlot.date + ': ' + (error.response.data.message || error.message));
        } else {
          alert('Failed to save slots for ' + dateSlot.date + ': ' + error.message);
        }
      }
    }

    // Clear preview slots after saving
    setPreviewSlots([]);
  };

  const handleEditSchedule = (date) => {
    const daySchedule = schedule.find(day => day.date === date);
    if (daySchedule && daySchedule.slots) {
      setEditedSlots(daySchedule.slots); // Load the slots for the selected date
      setSelectedDate(date);
    } else {
      console.error('No slots found for the selected date:', date);
    }
  };

  const handleSlotEditStatusChange = (index, status) => {
    const updatedSlots = [...editedSlots];
    updatedSlots[index].status = status; // Update the status of the selected slot
    setEditedSlots(updatedSlots);
  };

  const makeAllEditAvailable = () => {
    const updatedSlots = editedSlots.map(slot => ({ ...slot, status: 'Available' }));
    setEditedSlots(updatedSlots);
  };

  const makeAllEditUnavailable = () => {
    const updatedSlots = editedSlots.map(slot => ({ ...slot, status: 'Unavailable' }));
    setEditedSlots(updatedSlots);
  };

  const saveEditedSchedule = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to continue.');
      return;
    }

    try {
      const daySchedule = schedule.find(day => day.date === selectedDate);
      if (!daySchedule || !daySchedule._id) {
        console.error('Schedule ID is undefined for:', daySchedule);
        return; // Exit if the schedule is not found or ID is undefined
      }

      const response = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/schedule/${daySchedule._id}`, {
        slots: editedSlots,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        alert('Schedule updated successfully!');
      }
    } catch (error) {
      alert('Failed to save adjusted schedule: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to continue.');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get(`/api/schedule?email=${formData.email}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        const fetchedSchedule = response.data.schedule || [];
        if (fetchedSchedule.length === 0) {
          alert("You don't have a schedule yet.");
        } else {
          setSchedule(fetchedSchedule);
          alert('Schedule loaded successfully!');
        }
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
      alert('Failed to load schedule.');
    }
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setEditDate(selectedDate);
    const daySchedule = schedule.find(day => day.date === selectedDate);
    setSelectedDay(daySchedule || null); // Set selected day schedule or null if not found
  };

  const bulkUpdateSlots = (status) => {
    if (selectedDay) {
      setSelectedDay((prevDay) => {
        const updatedSlots = prevDay.slots.map(slot => ({
          ...slot,
          status,
        }));
        return { ...prevDay, slots: updatedSlots };
      });
    }
  };

  const handleSaveSchedule = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      showError('Please log in to continue.');
      navigate('/login');
      return;
    }

    const scheduleData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      clinic: formData.clinic,
      services: formData.services,
      date: formData.startDate, // Assuming you want to save the schedule for the start date
      slots: generateSlotsForDay(), // Call your function to generate slots for the day
    };

    console.log('Schedule Data:', scheduleData); // Log the schedule data

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/schedule`, scheduleData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        alert('Schedule saved successfully!');
      }
    } catch (error) {
      showError('Failed to save schedule: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchedule = async (scheduleId, updatedSlots) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showError('Please log in to continue.');
      navigate('/login');
      return;
    }

    try {
      // Prepare the data to send only the updated slots
      const updatedData = {
        slots: updatedSlots, // Send only the updated slots
      };

      const response = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/schedule/${scheduleId}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        alert('Schedule updated successfully!');
        // Optionally refresh the schedule data or update the state
      }
    } catch (error) {
      showError('Failed to update schedule: ' + (error.response?.data?.message || error.message));
    }
  };

  // Call this function when you want to update the schedule
  const saveUpdatedSchedule = (dayIndex) => {
    const daySchedule = schedule[dayIndex];
    const updatedSlots = daySchedule.slots; // Get the updated slots for this day
    handleUpdateSchedule(daySchedule.id, updatedSlots); // Assuming each daySchedule has an id
  };

  // Function to show user-friendly error messages
  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 5000); // Clear message after 5 seconds
  };

  const handleLoadSchedule = async () => {
    // Your existing logic to load the schedule
    // After loading the schedule, toggle the visibility
    setShowSlots(!showSlots);
  };

  return (
    <div className="test-schedule">
      {loading && <Spinner />} {/* Show loading spinner */}
      {errorMessage && <div className="error-message">{errorMessage}</div>} {/* Display error messages */}
      <h1>{isGeneratingSlots ? 'Generate Slots' : 'Edit Schedule'}</h1>
      <button onClick={() => setIsGeneratingSlots(true)}>Generate Slots</button>
      <button onClick={() => setIsGeneratingSlots(false)}>Edit Schedule</button>

      {isGeneratingSlots ? (
        <div>
          <label>
            Start Date:
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              min={formData.startDate} // Set minimum date to the calculated start date
            />
          </label>
          <label>
            End Date:
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              min={formData.startDate} // Set minimum date to the calculated start date
              max={maxEndDate} // Set maximum date to 60 days from today
            />
          </label>
          <label>
            Start Time:
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />
          </label>
          <label>
            End Time:
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            />
          </label>
          <button onClick={handleGenerateSlots}>Generate Slots</button>

          {/* Preview of generated slots */}
          {previewSlots.length > 0 && (
            <div>
              <h3>Preview Slots</h3>
              {previewSlots.map((dateSlots, dateIndex) => (
                <div key={dateIndex}>
                  <h4>Slots for {dateSlots.date}</h4>
                  {dateSlots.slots.map((slot, slotIndex) => (
                    <div key={slotIndex}>
                      <span>{slot.timeFrom} - {slot.timeTo}</span>
                      <select
                        value={slot.status}
                        onChange={(e) => handleSlotStatusChange(dateIndex, slotIndex, e.target.value)}
                      >
                        <option value="Available">Available</option>
                        <option value="Unavailable">Unavailable</option>
                      </select>
                    </div>
                  ))}
                  <button onClick={() => makeAllAvailable(dateIndex)}>Make All Available</button>
                  <button onClick={() => makeAllUnavailable(dateIndex)}>Make All Unavailable</button>
                </div>
              ))}
              <button onClick={finalizeSlots}>Save Slots</button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h3>Available Schedule Dates</h3>
          {schedule.map((day, index) => (
            <div key={index}>
              <span>{day.date}</span>
              <button onClick={() => handleEditSchedule(day.date)}>Edit</button>
            </div>
          ))}

          {/* Display the finalized slots for editing */}
          {selectedDate && editedSlots.length > 0 && (
            <div>
              <h3>Slots for {selectedDate}</h3>
              {editedSlots.map((slot, index) => (
                <div key={index}>
                  <span>{slot.timeFrom} - {slot.timeTo}</span>
                  <select
                    value={slot.status}
                    onChange={(e) => handleSlotStatusChange(0, index, e.target.value)} // Use 0 or the appropriate index for edited slots
                  >
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>
              ))}
              <button onClick={makeAllEditAvailable}>Make All Available</button>
              <button onClick={makeAllEditUnavailable}>Make All Unavailable</button>
              <button onClick={saveEditedSchedule}>Save Changes</button>
            </div>
          )}
        </div>
      )}

      {/* User Information Section */}
      <div>
        <h2>User Information</h2>
        <p>Email: {formData.email}</p>
        <p>First Name: {formData.firstName}</p>
        <p>Last Name: {formData.lastName}</p>
        <p>Clinic: {formData.clinic}</p>
        <p>Selected Services: {formData.services.join(', ')}</p>
      </div>
    </div>
  );
};

export default TestSchedule;
