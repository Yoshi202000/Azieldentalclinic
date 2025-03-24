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
  const [selectedDate, setSelectedDate] = useState(null);
  const [editedSlots, setEditedSlots] = useState([]);
  const [previewSlots, setPreviewSlots] = useState([]);
  const [isGeneratingSlots, setIsGeneratingSlots] = useState(true); // Toggle between generating and editing
  const [nextAvailableDate, setNextAvailableDate] = useState(null);
  const [maxEndDate, setMaxEndDate] = useState(null);
  const [visibleSlots, setVisibleSlots] = useState({});

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
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch user data.');
        }
  
        const userData = await response.json();
        const { firstName, lastName, email, clinic, services } = userData.user || {};
  
        setFormData((prevData) => ({
          ...prevData,
          firstName: firstName || '',
          lastName: lastName || '',
          email: email || '',
          clinic: clinic || '',
          services: Array.isArray(services) ? services.map((service) => service.name) : [],
        }));
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
        navigate('/login'); // Redirect to login if no token
        return;
      }
  
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/schedules`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (response.status === 200) {
          // Filter out duplicate schedules by date
          const filteredSchedules = response.data.reduce((acc, current) => {
            const date = new Date(current.date).toISOString().split('T')[0];
            // Only keep the first schedule for each date
            if (!acc.find(s => new Date(s.date).toISOString().split('T')[0] === date)) {
              acc.push(current);
            }
            return acc;
          }, []);

          setSchedule(filteredSchedules);
  
          // Determine the latest scheduled date
          if (filteredSchedules.length > 0) {
            const latestDate = new Date(
              Math.max(...filteredSchedules.map(s => new Date(s.date).getTime()))
            );
  
            // Set the next available start date (day after latest schedule)
            const nextAvailableDate = new Date(latestDate);
            nextAvailableDate.setDate(latestDate.getDate() + 1);
  
            setFormData(prevData => ({
              ...prevData,
              startDate: nextAvailableDate.toISOString().split('T')[0], // Format YYYY-MM-DD
            }));
          } else {
            // If no schedules exist, allow scheduling from tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
  
            setFormData(prevData => ({
              ...prevData,
              startDate: tomorrow.toISOString().split('T')[0],
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching schedules:', error);
  
        if (error.response?.status === 401) {
          alert('Session expired. Please log in again.');
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setErrorMessage('Failed to fetch schedules: ' + (error.response?.data?.message || error.message));
        }
      } finally {
        setLoading(false);
      }
    };
  
    // Ensure max end date is 60 days from today
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 60);
  
    setMaxEndDate(futureDate); // Save max end date
  
    // Set the endDate in formData (forces it to stay at 60 days from today)
    setFormData((prevData) => ({
      ...prevData,
      endDate: futureDate.toISOString().split('T')[0], // Format YYYY-MM-DD
    }));
  
    fetchUserData();
    fetchSchedules();
  }, [navigate]);
  
  
  useEffect(() => {
    const today = new Date();
  
    // Set maxEndDate to 60 days from today
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 60);
  
    setMaxEndDate(futureDate); // Save max end date
  
    setFormData((prevData) => ({
      ...prevData,
      endDate: futureDate.toISOString().split('T')[0], // Set fixed end date
    }));
  }, []); // Runs only once on mount
  

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
    if (maxEndDate && endDate > maxEndDate) {
      alert(`You can only create slots up to ${maxEndDate.toDateString()}`);
      return;
    }

    const newSlots = [];

    // Generate slots for each date in the range
    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      const slotsForDate = generateSlotsForDay(dateString); // Generate slots for the specific date
      newSlots.push({ date: dateString, slots: slotsForDate }); // Push an object with date and slots
    }
    console.log(newSlots);
    setPreviewSlots(newSlots); // Set the generated slots for preview
  };

  const handleSlotStatusChange = (slotIndex, newStatus) => {
    setEditedSlots(prevSlots => 
      prevSlots.map((slot, index) => 
        index === slotIndex ? { ...slot, status: newStatus } : slot
      )
    );
  };
  

  const makeAllAvailable = (dateIndex) => {
    setPreviewSlots((prev) => {
      const newPreview = [...prev]; // Create a copy of the current state
      newPreview[dateIndex].slots = newPreview[dateIndex].slots.map(slot => ({
        ...slot,
        status: 'Available', // Set all slots to Available
      }));
      return newPreview; // Return the updated state
    });
  };

  const makeAllUnavailable = (dateIndex) => {
    setPreviewSlots((prev) => {
      const newPreview = [...prev]; // Create a copy of the current state
      newPreview[dateIndex].slots = newPreview[dateIndex].slots.map(slot => ({
        ...slot,
        status: 'Unavailable', // Set all slots to Unavailable
      }));
      return newPreview; // Return the updated state
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

  const makeAllEditAvailable = () => {
    setEditedSlots(prevSlots => 
      prevSlots.map(slot => ({ ...slot, status: 'Available' }))
    );
  };

  const makeAllEditUnavailable = () => {
    setEditedSlots(prevSlots => 
      prevSlots.map(slot => ({ ...slot, status: 'Unavailable' }))
    );
  };

  const handleDateChange = (date) => {
    console.log('Raw selected date:', date);

    if (!date) {
      console.error('Date is null or undefined');
      setSelectedDate(null);
      return;
    }
  
    let parsedDate;
  
    if (typeof date === 'string') {
      parsedDate = new Date(date);
    } else if (date instanceof Date) {
      parsedDate = date;
    } else {
      console.error('Invalid date format:', date);
      setSelectedDate(null);
      return;
    }
  
    if (isNaN(parsedDate.getTime())) {
      console.error('Invalid Date object:', parsedDate);
      setSelectedDate(null);
      return;
    }
  
    const formattedDate = parsedDate.toISOString().split('T')[0];
    console.log('Formatted selected date:', formattedDate);
    
    // Find the schedule for the selected date and set editedSlots
    const daySchedule = schedule.find(day => new Date(day.date).toISOString().split('T')[0] === formattedDate);
    if (daySchedule && daySchedule.slots) {
      setEditedSlots(daySchedule.slots);
    } else {
      setEditedSlots([]);
    }
    
    setSelectedDate(formattedDate);
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

  const availableDates = previewSlots.map(slot => new Date(slot.date));

  const toggleSlotsVisibility = (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    setVisibleSlots((prev) => ({ ...prev, [formattedDate]: !prev[formattedDate] }));
    setSelectedDate(date);
  };

  const saveEditedSchedule = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to continue.');
      return;
    }

    try {
      const daySchedule = schedule.find(day => new Date(day.date).toISOString().split('T')[0] === selectedDate);
      if (!daySchedule || !daySchedule._id) {
        console.error('Schedule ID is undefined for:', daySchedule);
        return;
      }

      const response = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/api/schedule/${daySchedule._id}`, {
        slots: editedSlots,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'alert alert-success alert-dismissible fade show';
        successMessage.innerHTML = `
          Schedule updated successfully for ${selectedDate}!
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.querySelector('.test-schedule').insertBefore(successMessage, document.querySelector('.test-schedule').firstChild);
        
        // Remove the alert after 5 seconds
        setTimeout(() => {
          successMessage.remove();
        }, 5000);

        // Refresh the schedules after updating
        fetchSchedules();
      }
    } catch (error) {
     
    }
  };

  return (
    <div className="test-schedule">
      {loading && <Spinner />} {/* Show loading spinner */}
      {errorMessage && <div class="alert alert-danger">{errorMessage}</div>} {/* Display error messages */}
      <button class= "GenerateButton btn btn-primary me-2" onClick={() => setIsGeneratingSlots(true)}>Generate Slots</button>
      <button class= "GenerateButton btn btn-primary me-2" onClick={() => setIsGeneratingSlots(false)}>Edit Schedule</button>

      <h1 class=" text-center">{isGeneratingSlots ? 'Generate Slots' : 'Edit Schedule'}</h1>


      {isGeneratingSlots ? (
        <div class="row">
          <label>
            Start Date:
            <input
              class="form-control"
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
            className="form-control-plaintext"
            value={formData.endDate}
            readOnly // Prevent manual edits
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
          <button class= "GenerateButton btn btn-primary me-2" onClick={handleGenerateSlots}>Generate Slots</button>

          {/* Preview of generated slots */}
          {previewSlots.length > 0 && (
            <div class="justify-content-center">
              <div>
              <h3>Preview Slots</h3>
              {/* Calendar for Selecting Dates */}
      <div className="d-flex justify-content-center">
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="yyyy-MM-dd"
          class="form-control text-center w-50"
          placeholderText="Pick a date"
          inline
          highlightDates={availableDates} 
        />
      </div></div>

      {/* Display Slots for the Selected Date */}
      {selectedDate && (
        <>
          <h4 className="text-center mt-3">
            Available Slots for {selectedDate}
          </h4>
          {previewSlots.map((dateSlots, dateIndex) => {
            // Check if the date matches the selected date
            if (dateSlots.date === selectedDate) {
              return (
                <div key={dateIndex} className="">
                  <div className="card-body">
                    {dateSlots.slots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold">{slot.timeFrom} - {slot.timeTo}</span>
                        <select
                          className="form-select w-100"
                          value={slot.status}
                          onChange={(e) => handleSlotStatusChange(slotIndex, e.target.value)}
                        >
                          <option value="Available">Available</option>
                          <option value="Unavailable">Unavailable</option>
                        </select>
                      </div>
                    ))}
                  </div>
                  {/* Buttons to make all slots available/unavailable */}
                  <div className="d-flex justify-content-center gap-3 mt-3">
                    <button type="button" className="btn btn-success btn-lg px-4 py-2" onClick={() => makeAllAvailable(dateIndex)}>
                      Make All Available
                    </button>
                    <button type="button" className="btn btn-danger btn-lg px-4 py-2" onClick={() => makeAllUnavailable(dateIndex)}>
                      Make All Unavailable
                    </button>
                  </div>
                </div>
              );
            }
            return null; // Return null for dates that do not match
          })}
        </>
      )}
                          <div className="d-flex justify-content-center gap-3 mt-3">

                  <button class="btn btn-primary me-2" onClick={finalizeSlots}>Save Slots</button>
                  </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h3>Edit Schedule</h3>
          <div className="justify-content-center">
            <div>
              <h3>Select Date to Edit</h3>
              <div className="d-flex justify-content-center">
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  dateFormat="yyyy-MM-dd"
                  className="form-control text-center w-50"
                  placeholderText="Pick a date"
                  inline
                  highlightDates={schedule.map(day => new Date(day.date))}
                />
              </div>
            </div>

            {selectedDate && (
              <>
                <h4 className="text-center mt-3">
                  Available Slots for {selectedDate}
                </h4>
                {editedSlots.length > 0 ? (
                  <div className="card-body">
                    {editedSlots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold">{slot.timeFrom} - {slot.timeTo}</span>
                        <select
                          className="form-select w-100"
                          value={slot.status}
                          onChange={(e) => handleSlotStatusChange(slotIndex, e.target.value)}
                        >
                          <option value="Available">Available</option>
                          <option value="Unavailable">Unavailable</option>
                        </select>
                      </div>
                    ))}
                    <div className="d-flex justify-content-center gap-3 mt-3">
                      <button type="button" className="btn btn-success btn-lg px-4 py-2" onClick={makeAllEditAvailable}>
                        Make All Available
                      </button>
                      <button type="button" className="btn btn-danger btn-lg px-4 py-2" onClick={makeAllEditUnavailable}>
                        Make All Unavailable
                      </button>
                    </div>
                    <div className="d-flex justify-content-center gap-3 mt-3">
                      <button className="btn btn-primary btn-lg px-4 py-2" onClick={saveEditedSchedule}>
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="alert alert-info">
                    No slots available for this date.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default TestSchedule;
