import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import '../../test/TestSchedule.css';
import 'react-datepicker/dist/react-datepicker.css';
import Spinner from '../../test/Spinner';

const SuperEditSchedule = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    selectedDoctor: '',
    email: '',
    firstName: '',
    lastName: '',
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
  const [editDate, setEditDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSlots, setShowSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editedSlots, setEditedSlots] = useState([]);
  const [previewSlots, setPreviewSlots] = useState([]);
  const [isGeneratingSlots, setIsGeneratingSlots] = useState(true);
  const [nextAvailableDate, setNextAvailableDate] = useState(null);
  const [maxEndDate, setMaxEndDate] = useState(null);
  const [visibleSlots, setVisibleSlots] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/doctor-info`);
        if (response.status === 200) {
          setDoctors(response.data.doctors);
        } else {
          console.error('Failed to fetch doctors');
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setErrorMessage('Failed to fetch doctors');
      }
    };

    fetchDoctors();
  }, []);

  const handleDoctorSelect = (doctor) => {
    console.log('Selected doctor:', doctor); // Debug log
    setFormData(prev => ({
      ...prev,
      selectedDoctor: `${doctor.firstName} ${doctor.lastName}`,
      email: doctor.email,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      clinic: doctor.clinic,
      services: doctor.services || []
    }));
  };

  const fetchSchedules = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('Please log in to continue.');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/all-schedules`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        // Filter schedules by the selected doctor's email and remove duplicates by date
        const filteredSchedules = response.data
          .filter(schedule => schedule.email === formData.email)
          .reduce((acc, current) => {
            const date = new Date(current.date).toISOString().split('T')[0];
            // Only keep the first schedule for each date
            if (!acc.find(s => new Date(s.date).toISOString().split('T')[0] === date)) {
              acc.push(current);
            }
            return acc;
          }, []);

        console.log('Filtered schedules:', filteredSchedules);
        setSchedule(filteredSchedules);

        // Set default start date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        setFormData(prevData => ({
          ...prevData,
          startDate: tomorrow.toISOString().split('T')[0],
        }));

        // If there are existing schedules, update the start date to the day after the latest schedule
        if (filteredSchedules.length > 0) {
          const latestDate = new Date(
            Math.max(...filteredSchedules.map(s => new Date(s.date).getTime()))
          );
          const nextAvailableDate = new Date(latestDate);
          nextAvailableDate.setDate(latestDate.getDate() + 1);

          setFormData(prevData => ({
            ...prevData,
            startDate: nextAvailableDate.toISOString().split('T')[0],
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

  useEffect(() => {
    if (formData.email) {
      fetchSchedules();
    }
  }, [formData.email]);

  useEffect(() => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 60);

    setMaxEndDate(futureDate);
    setFormData((prevData) => ({
      ...prevData,
      endDate: futureDate.toISOString().split('T')[0],
    }));
  }, []);

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
      const newPreview = [...prev];
      newPreview[dateIndex].slots = newPreview[dateIndex].slots.map(slot => ({
        ...slot,
        status: 'Available',
      }));
      return newPreview;
    });
  };

  const makeAllUnavailable = (dateIndex) => {
    setPreviewSlots((prev) => {
      const newPreview = [...prev];
      newPreview[dateIndex].slots = newPreview[dateIndex].slots.map(slot => ({
        ...slot,
        status: 'Unavailable',
      }));
      return newPreview;
    });
  };

  const finalizeSlots = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to continue.');
      return;
    }

    setIsSaving(true);
    let successCount = 0;
    let errorCount = 0;
    const totalSchedules = previewSlots.length;

    // Create a loading message element
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'alert alert-info alert-dismissible fade show';
    loadingMessage.innerHTML = `
      <div class="d-flex align-items-center">
        <div class="spinner-border spinner-border-sm me-2" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        Creating schedules... <span class="ms-2">${successCount}/${totalSchedules}</span>
      </div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.querySelector('.test-schedule').insertBefore(loadingMessage, document.querySelector('.test-schedule').firstChild);

    // Iterate over each date in previewSlots and send a separate request
    for (const dateSlot of previewSlots) {
      const requestData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        clinic: formData.clinic,
        services: formData.services,
        date: dateSlot.date,
        slots: dateSlot.slots.map(slot => ({
          timeFrom: slot.timeFrom,
          timeTo: slot.timeTo,
          status: slot.status,
        })),
      };

      try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/schedule`, requestData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 201) {
          successCount++;
          // Update the loading message with progress
          loadingMessage.innerHTML = `
            <div class="d-flex align-items-center">
              <div class="spinner-border spinner-border-sm me-2" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              Creating schedules... <span class="ms-2">${successCount}/${totalSchedules}</span>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          `;
        }
      } catch (error) {
        console.error('Error saving slots for date:', dateSlot.date, error);
        errorCount++;
      }
    }

    // Remove the loading message
    loadingMessage.remove();

    // Show final success/error message
    const finalMessage = document.createElement('div');
    finalMessage.className = `alert ${errorCount === 0 ? 'alert-success' : 'alert-warning'} alert-dismissible fade show`;
    
    if (errorCount === 0) {
      finalMessage.innerHTML = `
        <div class="d-flex align-items-center">
          <i class="fas fa-check-circle me-2"></i>
          Successfully created ${successCount} schedule(s) from ${previewSlots[0].date} to ${previewSlots[previewSlots.length - 1].date}
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
    } else {
      finalMessage.innerHTML = `
        <div class="d-flex align-items-center">
          <i class="fas fa-exclamation-triangle me-2"></i>
          Created ${successCount} schedule(s) with ${errorCount} error(s)
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
    }

    document.querySelector('.test-schedule').insertBefore(finalMessage, document.querySelector('.test-schedule').firstChild);

    // Clear preview slots after saving
    setPreviewSlots([]);
    // Refresh the schedules after saving
    fetchSchedules();
    setIsSaving(false);
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
      const errorMessage = document.createElement('div');
      errorMessage.className = 'alert alert-danger alert-dismissible fade show';
      errorMessage.innerHTML = `
        Failed to save schedule: ${error.response?.data?.message || error.message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      document.querySelector('.test-schedule').insertBefore(errorMessage, document.querySelector('.test-schedule').firstChild);
    }
  };

  const availableDates = previewSlots.map(slot => new Date(slot.date));

  const toggleSlotsVisibility = (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    setVisibleSlots((prev) => ({ ...prev, [formattedDate]: !prev[formattedDate] }));
    setSelectedDate(date);
  };

  return (
    <div className="test-schedule">
      {loading && <Spinner />}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      
      <div className="doctor-selection mb-4">
        <h3>Select Doctor</h3>
        <select 
          className="form-select"
          value={formData.selectedDoctor}
          onChange={(e) => {
            const selectedDoctor = doctors.find(d => 
              `${d.firstName} ${d.lastName}` === e.target.value
            );
            if (selectedDoctor) {
              handleDoctorSelect(selectedDoctor);
            }
          }}
        >
          <option value="">Select a doctor</option>
          {doctors.map(doctor => (
            <option key={doctor._id} value={`${doctor.firstName} ${doctor.lastName}`}>
              {`Dr. ${doctor.firstName} ${doctor.lastName} - ${doctor.clinic}`}
            </option>
          ))}
        </select>
      </div>

      {formData.selectedDoctor && (
        <>
          <div className="doctor-info mb-4">
            <h3>Doctor Information</h3>
            <p><strong>Name:</strong> Dr. {formData.firstName} {formData.lastName}</p>
            <p><strong>Email:</strong> {formData.email}</p>
            <p><strong>Clinic:</strong> {formData.clinic}</p>
          </div>

          <div className="schedule-actions mb-4">
            <button className="btn btn-primary me-2" onClick={() => setIsGeneratingSlots(true)}>Generate Slots</button>
            <button className="btn btn-primary me-2" onClick={() => setIsGeneratingSlots(false)}>Edit Schedule</button>
          </div>

          <h1 className="text-center mb-4">{isGeneratingSlots ? 'Generate Slots' : 'Edit Schedule'}</h1>

          {isGeneratingSlots ? (
            <div className="row">
              <label>
                Start Date:
                <input
                  className="form-control"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  min={formData.startDate}
                />
              </label>
              <label>
                End Date:
                <input
                  type="date"
                  className="form-control-plaintext"
                  value={formData.endDate}
                  readOnly
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
              <button className="btn btn-primary me-2" onClick={handleGenerateSlots}>Generate Slots</button>

              {previewSlots.length > 0 && (
                <div className="justify-content-center">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3>Preview Slots</h3>
                    <button 
                      className="btn btn-primary btn-lg px-4 py-2" 
                      onClick={finalizeSlots}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : (
                        'Save All Slots'
                      )}
                    </button>
                  </div>
                  <div className="d-flex justify-content-center">
                    <DatePicker
                      selected={selectedDate}
                      onChange={handleDateChange}
                      dateFormat="yyyy-MM-dd"
                      className="form-control text-center w-50"
                      placeholderText="Pick a date"
                      inline
                      highlightDates={availableDates} 
                    />
                  </div>

                  {selectedDate && (
                    <>
                      <h4 className="text-center mt-3">
                        Available Slots for {selectedDate}
                      </h4>
                      {previewSlots.map((dateSlots, dateIndex) => {
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
                        return null;
                      })}
                    </>
                  )}
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
        </>
      )}
    </div>
  );
};

export default SuperEditSchedule;
